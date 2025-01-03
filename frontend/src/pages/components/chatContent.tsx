import ContentBox from "./contentBox";
import InputBox from "./inputBox";
import styles from "./styles/chatContent";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { backendUrl, backendWsUrl } from "./apiEndpoint";
import { useNavigate } from "react-router-dom";
import { CallMessage } from "../call";

export interface Message {
    username: string;
    content: string;
    isPrivate: boolean;
    timeStamp: string;
}

function ChatContent() {
    const msgSocketRef = useRef<WebSocket | null>(null);
    const callSocketRef = useRef<WebSocket | null>(null);
    const naviagate = useNavigate();

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
            msgSocketRef.current = new WebSocket(
                `${backendWsUrl}/ws?user=${encodeURIComponent(user)}`
            );

            // Initialize WebSocket connection
            callSocketRef.current = new WebSocket(
                `${backendWsUrl}/call?user=${encodeURIComponent(user)}`
            );

            callSocketRef.current.onclose = () => {
                console.log("Call WebSocket closed");
            };

            msgSocketRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data) as Message;
                setMessages((prevMessages) => [...prevMessages, message]);
            };

            callSocketRef.current.onmessage = async (event) => {
                const message = JSON.parse(event.data) as CallMessage;
                if (message.type === "offer") {
                    await callSocketRef.current?.close();
                    console.log(message.payload);
                    naviagate(
                        `/acceptCall?offer=${encodeURIComponent(
                            message.payload
                        )}&user=${encodeURIComponent(message.from)}`
                    );
                }
            };

            // Clean up on component unmount
            return () => {
                fetch(`${backendUrl}/logout?user=${encodeURIComponent(user)}`);
                msgSocketRef.current?.close();
                callSocketRef.current?.close();
            };
        }
    }, [user]);

    return (
        <div className={styles.container}>
            <ContentBox position="row-start-1 row-span-7" messages={messages} />
            <InputBox
                position="row-start-8 row-end-9"
                msgWs={msgSocketRef}
                callWs={callSocketRef}
                user={user}
            />
        </div>
    );
}

export default ChatContent;
