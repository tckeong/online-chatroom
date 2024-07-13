/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import SearchDropUp from "./searchDropUp";
import styles from "./styles/inputBox";

interface InputBoxProps {
    position: string;
    ws: React.MutableRefObject<WebSocket | null>;
    user: string | undefined;
}

function InputBox({ position, ws, user }: InputBoxProps) {
    const className = `grid grid-cols-5 pl-5 lg:pl-8 ${position}`;
    const [message, setMessage] = useState<string>("");
    const [name, setName] = useState<string>("");

    const handleMessageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setMessage(event.target.value);
    };

    const handleSendClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (user && ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(
                JSON.stringify({
                    from: user,
                    content: message,
                    to: name,
                })
            );
        }

        setName("");
        setMessage("");
    };

    return (
        <div className={className}>
            <SearchDropUp
                position="col-start-1 col-end-2"
                name={name}
                setName={setName}
            />
            <input
                className={styles.message}
                type="text"
                placeholder="Message"
                value={message}
                onChange={handleMessageChange}
            />
            <button
                className={styles.button}
                type="button"
                onClick={handleSendClick}
            >
                send
            </button>
        </div>
    );
}

export default InputBox;
