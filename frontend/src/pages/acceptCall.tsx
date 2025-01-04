import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { backendWsUrl } from "./components/apiEndpoint";
import { CallMessage } from "./call";

const AcceptCall = () => {
    const url = new URL(window.location.href);
    const offer = url.searchParams.get("offer") ?? "";
    const fromUser = url.searchParams.get("user") ?? "";
    const self = Cookies.get("user") ?? "";
    const [isSetup, setIsSetup] = useState<boolean>(false);

    const candidatesBuffer = useRef<RTCIceCandidate[]>([]);

    const server = {
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ],
            },
        ],
    };

    const ws = useRef<WebSocket | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        peerConnection.current = new RTCPeerConnection(server);
        // Create a new MediaStream for remote video
        const stream = new MediaStream();

        // Attach the stream to the video element
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
        }

        // Handle the 'ontrack' event
        peerConnection.current.ontrack = (event) => {
            // Add tracks to the remote MediaStream
            event.streams[0].getTracks().forEach((track) => {
                stream.addTrack(track);
            });
        };

        setIsSetup(true);
    }, [self]);

    useEffect(() => {
        if (!self) return;
        if (!peerConnection.current) return;

        ws.current = new WebSocket(
            `${backendWsUrl}/call?user=${encodeURIComponent(self)}`
        );

        ws.current.onopen = async () => {
            peerConnection.current
                ?.setRemoteDescription(
                    JSON.parse(offer) as RTCSessionDescriptionInit
                )
                .then(() => {
                    return peerConnection.current?.createAnswer();
                })
                .then((answer) => {
                    return peerConnection.current?.setLocalDescription(answer);
                })
                .then(() => {
                    ws.current?.send(
                        JSON.stringify({
                            from: self,
                            to: fromUser,
                            type: "answer",
                            payload: JSON.stringify(
                                peerConnection.current?.localDescription
                            ),
                        })
                    );
                });
            // const answer = await peerConnection.current?.createAnswer();
            // await peerConnection.current?.setLocalDescription(answer);
            // ws.current?.send(
            //     JSON.stringify({
            //         from: self,
            //         to: fromUser,
            //         type: "answer",
            //         payload: JSON.stringify(
            //             peerConnection.current?.localDescription
            //         ),
            //     })
            // );

            // Add buffered candidates
            candidatesBuffer.current.forEach(async (candidate) => {
                try {
                    await peerConnection.current?.addIceCandidate(candidate);
                } catch (error) {
                    console.error(
                        "Error adding buffered ICE candidate:",
                        error
                    );
                }
            });
            candidatesBuffer.current.length = 0; // Clear the buffer
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                ws.current?.send(
                    JSON.stringify({
                        from: self,
                        to: fromUser,
                        type: "candidates",
                        payload: JSON.stringify(event.candidate),
                    })
                );
            }
        };

        ws.current.onerror = (error) =>
            console.error("WebSocket error:", error);

        ws.current.onclose = () => {
            console.log("WebSocket closed");
        };

        ws.current.onmessage = async (event) => {
            const message: CallMessage = JSON.parse(event.data) as CallMessage;

            switch (message.type) {
                case "candidates": {
                    const candidate = JSON.parse(message.payload);
                    if (peerConnection.current?.remoteDescription) {
                        try {
                            await peerConnection.current.addIceCandidate(
                                candidate
                            );
                        } catch (error) {
                            console.error("Error adding ICE candidate:", error);
                        }
                    } else {
                        console.warn(
                            "Remote description not set. Buffering candidate."
                        );
                        candidatesBuffer.current.push(candidate);
                    }
                    break;
                }
            }
        };
    }, [isSetup]);

    return (
        <div>
            <video ref={remoteVideoRef} autoPlay playsInline />
            <h1>Accept Call</h1>
        </div>
    );
};

export default AcceptCall;
