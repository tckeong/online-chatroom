import ChatContent from "./components/chatContent";
import { useNavigate } from "react-router-dom";
import styles from "./styles/index";
import Cookies from "js-cookie";
import UserButton from "./components/userButton";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setMsgWebSocket,
    setCallWebSocket,
    setPeerConnection,
    addRemoteCandidate,
} from "../reduxState/webSocketWebrtcSlice";
import { RootState, AppDispatch } from "../reduxState/store";
import { backendWsUrl } from "./components/apiEndpoint";

function Index() {
    const user = Cookies.get("user");
    const isLogin = user !== undefined;
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { msgWs, callWs, peerConnection, remoteCandidates } = useSelector(
        (state: RootState) => state.webSocketWebRTC
    );

    useEffect(() => {
        if (!isLogin) return;

        const msgSocket = new WebSocket(`${backendWsUrl}/ws?user=${encodeURIComponent(user)}`);
        const callSocket = new WebSocket(`${backendWsUrl}/call?user=${encodeURIComponent(user)}`);

        msgSocket.onopen = () => {
            console.log("Message WebSocket connected");
        };
        msgSocket.onclose = () => {
            console.log("Message WebSocket closed");
        };
        msgSocket.onerror = (error) => {
            console.error("Message WebSocket error:", error);
        };
        msgSocket.onmessage = (event) => {
            
        };
    }, [isLogin]);

    return (
        <div className="grid grid-rows-6 w-full h-full bg-gray-200 overflow-hidden">
            <header className="grid grid-cols-3 row-start-1 row-end-2 bg-slate-700">
                <h1 className={styles.title}>Chatroom</h1>
                {isLogin ? (
                    <UserButton position="col-start-3 col-end-4" />
                ) : (
                    <div className="flex flex-col lg:flex-row items-center col-start-3 col-end-4">
                        <button
                            className={styles.loginButton}
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                        <button
                            className={styles.registerButton}
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                    </div>
                )}
            </header>
            <div className="row-start-2 row-span-5 h-full w-full">
                <ChatContent />
            </div>
        </div>
    );
}

export default Index;
