import { useEffect, useRef, useState } from "react";

const VideoCall = ({ socket, loggedInUserId, selectedUserId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [inCall, setInCall] = useState(false);
  const iceQueue = useRef([]); // store ICE candidates if peer not ready

  useEffect(() => {
    if (!socket) return;

    // Handle Offer
    socket.on("offer", async ({ from, sdp }) => {
      if (from !== selectedUserId) return;
      try {
        await createPeerConnection();
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { to: from, sdp: answer });
      } catch (err) {
        alert("Offer error: " + err.message);
      }
    });

    // Handle Answer
    socket.on("answer", async ({ from, sdp }) => {
      if (from !== selectedUserId) return;
      try {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
        } else {
          alert("Peer connection missing when answer received!");
        }
      } catch (err) {
        alert("Answer error: " + err.message);
      }
    });

    // Handle ICE candidates
    socket.on("ice-candidate", async ({ from, candidate }) => {
      if (from !== selectedUserId) return;
      try {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // store until peer ready
          iceQueue.current.push(candidate);
        }
      } catch (err) {
        alert("ICE error: " + err.message);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, selectedUserId]);

  // Create Peer Connection
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
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });
    } catch (err) {
      alert("Media device error: " + err.message);
    }

    // process queued ICE candidates
    while (iceQueue.current.length) {
      const c = iceQueue.current.shift();
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(c));
      } catch (err) {
        alert("Error adding queued ICE: " + err.message);
      }
    }
  };

  // Start call
  const startCall = async () => {
    try {
      await createPeerConnection();
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", { to: selectedUserId, from: loggedInUserId, sdp: offer });
      setInCall(true);
    } catch (err) {
      alert("Start call error: " + err.message);
    }
  };

  // End call
  const endCall = () => {
    try {
      peerConnection.current?.close();
      peerConnection.current = null;
      setInCall(false);
    } catch (err) {
      alert("End call error: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 border rounded bg-gray-100">
      <div className="flex gap-2">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-40 h-32 bg-black" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-40 h-32 bg-black" />
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
