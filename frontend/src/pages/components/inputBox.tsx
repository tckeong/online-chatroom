/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import SearchDropUp from "./searchDropUp";
import styles from "./styles/inputBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

interface InputBoxProps {
    position: string;
    msgWs: React.MutableRefObject<WebSocket | null>;
    callWs: React.MutableRefObject<WebSocket | null>;
    user: string | undefined;
}

function InputBox({ position, msgWs, callWs, user }: InputBoxProps) {
    const className = `grid grid-cols-5 pl-5 lg:pl-8 ${position}`;
    const [message, setMessage] = useState<string>("");
    const [name, setName] = useState<string>("");
    const navigate = useNavigate();

    const handleMessageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setMessage(event.target.value);
    };

    const checkLoginState = () => {
        if (!user) {
            alert("Please log in to send messages.");
            navigate("/login");
            return false;
        }

        return true;
    };

    const checkNameState = () => {
        if (!name) {
            alert("Please enter a recipient.");
            return false;
        }

        return true;
    };

    const handleSendClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!checkLoginState() || !checkNameState()) {
            return;
        }

        if (
            user &&
            msgWs.current &&
            msgWs.current.readyState === WebSocket.OPEN
        ) {
            msgWs.current.send(
                JSON.stringify({
                    from: user,
                    content: message,
                    to: name,
                })
            );
        } else {
            alert("Failed to send message.");
            return;
        }

        setName("");
        setMessage("");
    };

    const handleCallClick = async (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();

        if (!checkLoginState() || !checkNameState()) {
            return;
        }

        await msgWs.current?.close();
        await callWs.current?.close();
        navigate(`/call?user=${name}`);
        setName("");
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
            <div className="flex flex-row items-center col-start-5 col-end-6">
                <button
                    className="basis-1/2 lg:-ml-6 lg:-mr-4 w-fit h-fit hover:text-blue-800"
                    onClick={handleCallClick}
                >
                    <FontAwesomeIcon icon={faPhone} />
                </button>
                <button
                    className={styles.button}
                    type="button"
                    onClick={handleSendClick}
                >
                    send
                </button>
            </div>
        </div>
    );
}

export default InputBox;
