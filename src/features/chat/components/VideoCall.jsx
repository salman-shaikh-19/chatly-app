import { useEffect, useRef, useState } from "react";

const VideoCall = ({ socket, loggedInUserId, selectedUserId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const pendingCandidates = useRef([]);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Handle Offer
    socket.on("offer", async ({ from, sdp }) => {
      if (from !== selectedUserId) return;

      try {
        if (!peerConnection.current) {
          await createPeerConnection();
        }

        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );

        // Create Answer only if state is correct
        if (peerConnection.current.signalingState === "have-remote-offer") {
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);

          socket.emit("answer", { to: from, sdp: answer });
        }

        // ✅ Apply queued ICE candidates
        while (pendingCandidates.current.length > 0) {
          const cand = pendingCandidates.current.shift();
          try {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(cand)
            );
          } catch (err) {
            console.error("Queued ICE error:", err);
            alert("Queued ICE error: " + err.message);
          }
        }
      } catch (err) {
        alert("Offer error: " + err.message);
      }
    });

    // Handle Answer
    socket.on("answer", async ({ from, sdp }) => {
      if (from !== selectedUserId) return;
      try {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );

        // ✅ Apply queued ICE after remote desc set
        while (pendingCandidates.current.length > 0) {
          const cand = pendingCandidates.current.shift();
          try {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(cand)
            );
          } catch (err) {
            console.error("Queued ICE error:", err);
          }
        }
      } catch (err) {
        alert("Answer error: " + err.message);
      }
    });

    // Handle ICE Candidate
    socket.on("ice-candidate", async ({ from, candidate }) => {
      if (from !== selectedUserId) return;

      try {
        if (!candidate) return; // ignore null candidates

        if (peerConnection.current?.remoteDescription) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } else {
          // queue until remote description is set
          pendingCandidates.current.push(candidate);
        }
      } catch (err) {
        console.error("ICE error:", err);
        alert("ICE Candidate error: " + err.message);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, selectedUserId]);

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
      // Try to get camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });
    } catch (err) {
      alert(
        "No camera/mic found on this device. You will only see remote video."
      );
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
        {/* Local video (may be empty if no camera) */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-40 h-32 bg-gray-800"
        />

        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-40 h-32 bg-black"
        />
      </div>

      {!inCall ? (
        <button
          onClick={startCall}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          📞 Start Call
        </button>
      ) : (
        <button
          onClick={endCall}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          ❌ End Call
        </button>
      )}
    </div>
  );
};

export default VideoCall;
