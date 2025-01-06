import ContentBox from "./contentBox";
import InputBox from "./inputBox";
import styles from "./styles/chatContent";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { CallMessage } from "../call";
import { useConn } from "../../useConn";
export interface Message {
    username: string;
    content: string;
    isPrivate: boolean;
    timeStamp: string;
}

function ChatContent() {
    const { msgSocket, callSocket, peerConnection } = useConn();
    const navigate = useNavigate();

    const [messages, setMessages] = useState<Message[]>([
        {
            username: "Default",
            content: "Welcome to this Chatroom!",
            isPrivate: false,
            timeStamp: Date.now().toString(),
        },
    ]);
    const user = Cookies.get("user");

    useEffect(() => {
        if (user) {
            if (msgSocket == null || callSocket == null) return;

            msgSocket.onmessage = (event) => {
                const message = JSON.parse(event.data) as Message;
                setMessages((prevMessages) => [...prevMessages, message]);
            };

            callSocket.onmessage = async (event) => {
                const message = JSON.parse(event.data) as CallMessage;

                switch (message.type) {
                    case "offer": {
                        peerConnection
                            ?.setRemoteDescription(JSON.parse(message.payload))
                            .then(() => {
                                return peerConnection?.createAnswer();
                            })
                            .then((answer) => {
                                peerConnection?.setLocalDescription(answer);
                                callSocket.send(
                                    JSON.stringify({
                                        from: user,
                                        to: message.from,
                                        type: "answer",
                                        payload: JSON.stringify(answer),
                                    })
                                );
                            })
                            .then(() => {
                                navigate(
                                    `/acceptCall?user=${encodeURIComponent(
                                        message.from
                                    )}`
                                );
                            });
                        break;
                    }
                    case "candidates": {
                        const candidate = JSON.parse(
                            message.payload
                        ) as RTCIceCandidate;
                        await peerConnection?.addIceCandidate(candidate);
                        break;
                    }
                    case "end": {
                        break;
                    }
                }
            };
        }
    }, [user, msgSocket, callSocket, peerConnection, navigate]);

    return (
        <div className={styles.container}>
            <ContentBox position="row-start-1 row-span-7" messages={messages} />
            <InputBox position="row-start-8 row-end-9" user={user} />
        </div>
    );
}

export default ChatContent;
