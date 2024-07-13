import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages";
import Login from "./pages/login";
import Register from "./pages/register";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<h1>404 not found!</h1>}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
