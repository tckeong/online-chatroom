import { useEffect, useRef, useState } from "react";
import styles from "./styles/call";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMicrophone,
    faMicrophoneSlash,
    faPhone,
    faVideo,
    faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { backendWsUrl } from "./components/apiEndpoint";

function Call() {
    const url = new URL(window.location.href);
    const user = url.searchParams.get("user") ?? "";
    const self = Cookies.get("user") ?? "";
    const ws = useRef<WebSocket | null>(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isInCall, setIsInCall] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isCameraOff, setIsCameraOff] = useState<boolean>(false);

    useEffect(() => {
        if (user && self) {
            ws.current = new WebSocket(
                `${backendWsUrl}/call?user=${encodeURIComponent(user)}`
            );

            if (ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(
                    JSON.stringify({
                        from: self,
                        to: user,
                        content: "offer",
                    })
                );
            }
        }
    }, []);

    return (
        <div className="flex flex-col h-full w-full bg-gray-300">
            <div className="flex flex-row h-full w-full basis-4/5">
                <div className="basis-3/4 h-full w-full">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        className="basis-5/6 m-6"
                    />
                </div>
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
                <button className="w-fit h-fit lg:border-2 lg:border-black lg:p-6 lg:px-6 rounded-full m-3 text-red-600 hover:bg-red-700 hover:text-white">
                    <FontAwesomeIcon icon={faPhone} size="2x" />
                </button>
            </div>
        </div>
    );
}

export default Call;
