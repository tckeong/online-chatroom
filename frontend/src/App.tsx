import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages";
import Login from "./pages/login";
import Register from "./pages/register";
import Call from "./pages/call";
import AcceptCall from "./pages/acceptCall";
import { ConnProvider } from "./connContext";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

function App() {
    const [cookieUser, setCookieUser] = useState<string | undefined>(
        Cookies.get("user")
    );
    const [user, setUser] = useState<string>(Cookies.get("user") ?? "");

    useEffect(() => {
        if (cookieUser !== undefined) {
            setUser(cookieUser);
        }
    }, [cookieUser]);

    return (
        <ConnProvider user={user ?? ""}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Index setCookieUser={setCookieUser} />}
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/call" element={<Call />} />
                    <Route path="/acceptCall" element={<AcceptCall />} />
                    <Route path="*" element={<h1>404 not found!</h1>}></Route>
                </Routes>
            </BrowserRouter>
        </ConnProvider>
    );
}

export default App;
