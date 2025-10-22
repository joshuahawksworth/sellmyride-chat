import { useState, useEffect } from "react";
import Login from "./Login";

export default function ChatApp() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        // if user is already logged in
        const savedUser = localStorage.getItem("user");
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
    }, [token]);

    const handleLogin = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
    };

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div>
            <div className="chat-header">
                <h1 className="chat-title">Welcome, {user.name}!</h1>
                <button onClick={handleLogout} className="btn-logout">
                    Logout
                </button>
            </div>
            <div className="chat-content"></div>
        </div>
    );
}
