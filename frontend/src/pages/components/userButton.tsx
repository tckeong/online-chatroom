import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import styles from "./styles/userButton";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "./apiEndpoint";

interface UserButtonProps {
    position: string;
}

function UserButton({ position }: UserButtonProps) {
    const className = `relative flex flex-row items-center text-white font-mono text-lg lg:ml-32 lg:text-5xl ${position}`;
    const user = Cookies.get("user");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropDownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropDownRef.current &&
            !dropDownRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        if (user) {
            fetch(`${backendUrl}/logout?user=${encodeURIComponent(user)}`);
            Cookies.remove("user");
            alert("Logout successful!");
            navigate("/");
        }
    };

    const handleUserClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsOpen((isOpen) => !isOpen);
    };

    return (
        <button className={className} onClick={handleUserClick} ref={buttonRef}>
            <FontAwesomeIcon icon={faUser} className="text-4xl mr-2" />
            <span className="text-2xl font-mono">{user}</span>
            {isOpen && (
                <div className={styles.dropDown} ref={dropDownRef}>
                    <button className="w-full h-1/2" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </button>
    );
}

export default UserButton;
