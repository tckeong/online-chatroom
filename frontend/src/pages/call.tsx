import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMicrophone,
    faMicrophoneSlash,
    faPhone,
    faVideo,
    faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useConn } from "../useConn";

export interface CallMessage {
    from: string;
    to: string;
    payload: string;
    type: string;
}

function Call() {
    const url = new URL(window.location.href);
    const toUser = url.searchParams.get("user") ?? "";
    const self = Cookies.get("user") ?? "";
    const navigate = useNavigate();
    const { msgSocket, callSocket, peerConnection } = useConn();

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isCameraOff, setIsCameraOff] = useState<boolean>(false);

    useEffect(() => {
        if (!callSocket) return;

        callSocket.onerror = (error) =>
            console.error("WebSocket error:", error);
        callSocket.onclose = () => {
            console.log("WebSocket closed");
        };

        callSocket.onmessage = async (event) => {
            const message: CallMessage = JSON.parse(event.data) as CallMessage;

            switch (message.type) {
                case "candidates": {
                    const candidate = JSON.parse(
                        message.payload
                    ) as RTCIceCandidate;
                    await peerConnection?.addIceCandidate(candidate);
                    break;
                }
                case "answer": {
                    const remoteAnswer = JSON.parse(
                        message.payload
                    ) as RTCSessionDescription;
                    await peerConnection?.setRemoteDescription(remoteAnswer);
                    break;
                }
            }
        };
    }, [callSocket, peerConnection]);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                stream.getTracks().forEach((track) => {
                    peerConnection?.addTrack(track, stream);
                });
            })
            .catch((err) =>
                console.error("Error accessing media devices:", err)
            );
    }, [peerConnection]);

    useEffect(() => {
        if (!toUser || !self || !localStream) return;
        if (!peerConnection) return;

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                callSocket?.send(
                    JSON.stringify({
                        from: self,
                        to: toUser,
                        type: "candidates",
                        payload: JSON.stringify(event.candidate),
                    })
                );
            }
        };

        peerConnection
            .createOffer()
            .then((offer) => {
                return peerConnection.setLocalDescription(offer);
            })
            .then(() => {
                callSocket?.send(
                    JSON.stringify({
                        from: self,
                        to: toUser,
                        type: "offer",
                        payload: JSON.stringify(
                            peerConnection.localDescription
                        ),
                    })
                );
            });
    }, [self, toUser, localStream, callSocket, peerConnection, msgSocket]);

    useEffect(() => {
        if (!localStream) return;

        if (isMuted) {
            localStream
                .getAudioTracks()
                .forEach((track) => (track.enabled = false));
        } else {
            localStream
                .getAudioTracks()
                .forEach((track) => (track.enabled = true));
        }
    }, [isMuted, localStream]);

    useEffect(() => {
        if (!localStream) return;

        if (isCameraOff) {
            localStream
                .getVideoTracks()
                .forEach((track) => (track.enabled = false));
        } else {
            localStream
                .getVideoTracks()
                .forEach((track) => (track.enabled = true));
        }
    }, [isCameraOff, localStream]);

    const handleCallEnd = () => {
        callSocket?.send(
            JSON.stringify({
                from: self,
                to: toUser,
                type: "end",
                payload: "",
            })
        );
        alert("Call ended");
        localStream?.getTracks().forEach((track) => track.stop());
        navigate("/");
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-300">
            <div className="flex flex-row h-full w-full basis-4/5">
                <div className="basis-3/4 h-full w-full"></div>
                <div className="flex flex-col basis-1/4 h-full w-full">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className="basis-1/4 m-2"
                    />
                </div>
            </div>
            <div className="flex item-center justify-center basis-1/5">
                {isMuted ? (
                    <button
                        className="w-fit h-fit lg:border-2 lg:border-black bg-red-600 lg:p-6 rounded-full m-3"
                        onClick={() => setIsMuted(false)}
                    >
                        <FontAwesomeIcon icon={faMicrophoneSlash} size="2x" />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsMuted(true)}
                        className="w-fit h-fit lg:border-2 lg:border-black lg:p-6 lg:px-8 rounded-full m-3 hover:bg-red-700 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faMicrophone} size="2x" />
                    </button>
                )}
                {isCameraOff ? (
                    <button
                        className="w-fit h-fit lg:border-2 lg:border-black bg-red-600 lg:p-6 rounded-full lg:m-3"
                        onClick={() => setIsCameraOff(false)}
                    >
                        <FontAwesomeIcon icon={faVideoSlash} size="2x" />
                    </button>
                ) : (
                    <button
                        className="w-fit h-fit lg:border-2 lg:border-black lg:p-6 lg:px-[6.5] rounded-full m-3 hover:bg-red-700 hover:text-white"
                        onClick={() => setIsCameraOff(true)}
                    >
                        <FontAwesomeIcon icon={faVideo} size="2x" />
                    </button>
                )}
                <button
                    className="w-fit h-fit lg:border-2 lg:border-black lg:p-6 lg:px-6 rounded-full m-3 text-red-600 hover:bg-red-700 hover:text-white"
                    onClick={handleCallEnd}
                >
                    <FontAwesomeIcon icon={faPhone} size="2x" />
                </button>
            </div>
        </div>
    );
}

export default Call;
