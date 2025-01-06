import Cookies from "js-cookie";
import { useEffect, useRef } from "react";
import { useConn } from "../useConn";
import { CallMessage } from "./call";
import { useNavigate } from "react-router-dom";

const AcceptCall = () => {
    const url = new URL(window.location.href);
    const fromUser = url.searchParams.get("user") ?? "";
    const self = Cookies.get("user") ?? "";
    const navigate = useNavigate();
    const { callSocket, peerConnection } = useConn();

    // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (!peerConnection) return;

        // Create a new MediaStream for remote video
        const stream = new MediaStream();

        // Attach the stream to the video element
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
        }

        // Handle the 'ontrack' event
        peerConnection.ontrack = (event) => {
            // Add tracks to the remote MediaStream
            event.streams[0].getTracks().forEach((track) => {
                stream.addTrack(track);
            });
        };
    }, [self, peerConnection]);

    useEffect(() => {
        if (!self) return;
        if (!peerConnection || !callSocket) return;

        callSocket.onmessage = async (event) => {
            const message = JSON.parse(event.data) as CallMessage;

            switch (message.type) {
                case "candidates": {
                    const candidate = JSON.parse(
                        message.payload
                    ) as RTCIceCandidate;
                    await peerConnection?.addIceCandidate(candidate);
                    break;
                }
                case "end": {
                    const mediaStream = remoteVideoRef.current
                        ?.srcObject as MediaStream;
                    mediaStream?.getTracks().forEach((track) => {
                        track.stop();
                    });
                    alert("Call ended");
                    navigate("/");
                    break;
                }
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                callSocket?.send(
                    JSON.stringify({
                        from: self,
                        to: fromUser,
                        type: "candidates",
                        payload: JSON.stringify(event.candidate),
                    })
                );
            }
        };
    }, [self, fromUser, callSocket, peerConnection, navigate]);

    return (
        <div>
            <video ref={remoteVideoRef} autoPlay playsInline />
            <h1>Accept Call</h1>
        </div>
    );
};

export default AcceptCall;
