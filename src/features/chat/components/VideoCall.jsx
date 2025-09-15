import { useEffect, useRef, useState } from "react";

const VideoCall = ({ socket, loggedInUserId, selectedUserId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const pendingCandidates = useRef([]);
  const [inCall, setInCall] = useState(false);

  // Initialize WebRTC listeners
  useEffect(() => {
    if (!socket) return;

    // Offer received
    socket.on("offer", async ({ from, sdp }) => {
      if (from !== selectedUserId) return;

      try {
        if (!peerConnection.current) await createPeerConnection();

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));

        if (peerConnection.current.signalingState === "have-remote-offer") {
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);

          socket.emit("answer", { to: from, sdp: answer });
        }

        // Apply queued ICE candidates
        while (pendingCandidates.current.length > 0) {
          const cand = pendingCandidates.current.shift();
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(cand));
          } catch (err) {
            alert("Queued ICE error: " + err.message);
          }
        }
      } catch (err) {
        alert("Offer error: " + err.message);
      }
    });

    // Answer received
    socket.on("answer", async ({ from, sdp }) => {
      if (from !== selectedUserId) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));

        while (pendingCandidates.current.length > 0) {
          const cand = pendingCandidates.current.shift();
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(cand));
          } catch (err) {
            alert("Queued ICE error: " + err.message);
          }
        }
      } catch (err) {
        alert("Answer error: " + err.message);
      }
    });

    // ICE candidate received
    socket.on("ice-candidate", async ({ from, candidate }) => {
      if (from !== selectedUserId || !candidate) return;

      try {
        if (peerConnection.current?.remoteDescription) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidates.current.push(candidate);
        }
      } catch (err) {
        alert("ICE Candidate error: " + err.message);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, selectedUserId]);

  // Create peer connection and add tracks
  const createPeerConnection = async () => {
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: selectedUserId,
          from: loggedInUserId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));
    } catch (err) {
      alert("No camera/mic found. Sending dummy video track for connection.");

      // Create a dummy video track so connection works
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const stream = canvas.captureStream(10); // 10 FPS
      const [videoTrack] = stream.getVideoTracks();
      peerConnection.current.addTrack(videoTrack, stream);

      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    }
  };

  const startCall = async () => {
    try {
      await createPeerConnection();
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("offer", {
        to: selectedUserId,
        from: loggedInUserId,
        sdp: offer,
      });

      setInCall(true);
    } catch (err) {
      alert("Start call error: " + err.message);
    }
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    setInCall(false);
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 border rounded bg-gray-100">
      <div className="flex gap-2">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-40 h-32 bg-gray-800" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-40 h-32 bg-black" />
      </div>

      {!inCall ? (
        <button onClick={startCall} className="px-4 py-2 bg-green-500 text-white rounded">
          📞 Start Call
        </button>
      ) : (
        <button onClick={endCall} className="px-4 py-2 bg-red-500 text-white rounded">
          ❌ End Call
        </button>
      )}
    </div>
  );
};

export default VideoCall;
