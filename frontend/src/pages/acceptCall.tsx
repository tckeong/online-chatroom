import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { backendWsUrl } from "./components/apiEndpoint";
import { CallMessage } from "./call";

const AcceptCall = () => {
    const url = new URL(window.location.href);
    const offer = url.searchParams.get("offer") ?? "";
    const fromUser = url.searchParams.get("user") ?? "";
    const self = Cookies.get("user") ?? "";

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

    const ws = useRef<WebSocket>(
        new WebSocket(`${backendWsUrl}/call?user=${encodeURIComponent(self)}`)
    );
    const peerConnection = useRef<RTCPeerConnection>(
        new RTCPeerConnection(server)
    );
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (!self) return;

        ws.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log(message);
            const offer = JSON.parse(message.payload);
            //                 await peerConnection.current.setRemoteDescription(
            //                     offer
            //                 );
            //                 const answer =
            //                     await peerConnection.current.createAnswer();
            //                 await peerConnection.current.setLocalDescription(
            //                     answer
            //                 );
            //                 ws.current.send(
            //                     JSON.stringify({
            //                         from: self,
            //                         to: toUser,
            //                         type: "answer",
            //                         payload: JSON.stringify(answer),
            //                     })
            //                 );
            //                 break;
        };
    }, [self]);

    return (
        <div>
            <h1>Accept Call</h1>
        </div>
    );
};

export default AcceptCall;
