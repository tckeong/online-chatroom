import ContentBox from "./contentBox";
import InputBox from "./inputBox";
import styles from "./styles/chatContent";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";

export interface Message {
    username: string;
    content: string;
    isPrivate: boolean;
    timeStamp: string;
}

function ChatContent() {
    const socketRef = useRef<WebSocket | null>(null);
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
            socketRef.current = new WebSocket(
                `ws://localhost:8080/ws?user=${encodeURIComponent(user)}`
            );

            socketRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data) as Message;
                setMessages((prevMessages) => [...prevMessages, message]);
            };

            // Clean up on component unmount
            return () => {
                fetch(
                    `http://localhost:8080/logout?user=${encodeURIComponent(
                        user
                    )}`
                );
                socketRef.current?.close();
            };
        }
    }, [user]);

    return (
        <div className={styles.container}>
            <ContentBox position="row-start-1 row-span-7" messages={messages} />
            <InputBox
                position="row-start-8 row-end-9"
                ws={socketRef}
                user={user}
            />
        </div>
    );
}

export default ChatContent;
