import ChatContent from "./components/chatContent";
import { useNavigate } from "react-router-dom";
import styles from "./styles/index";
import Cookies from "js-cookie";
import UserButton from "./components/userButton";

function Index() {
    const isLogin = Cookies.get("user") !== undefined;
    const navigate = useNavigate();

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