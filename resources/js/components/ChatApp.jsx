import { useState, useEffect } from "react";
import Login from "./Login";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import api from "../api";

export default function ChatApp() {
    const [user, setUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [conversation, setConversation] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            // Reinitialize Echo with current token
            if (window.initializeEcho) {
                window.initializeEcho();
            }
        }
    }, []);

    const handleLogin = (userData, userToken) => {
        setUser(userData);
        // Reinitialize Echo after login with new token
        if (window.initializeEcho) {
            window.initializeEcho();
        }
    };

    const handleLogout = () => {
        if (window.Echo) {
            window.Echo.disconnect();
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const handleSelectUser = async (selectedUser) => {
        setSelectedUser(selectedUser);

        try {
            const response = await api.post("/conversations", {
                user_id: selectedUser.id,
            });
            setConversation(response.data);
        } catch (error) {
            console.error("Failed to create/get conversation:", error);
        }
    };

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="chat-app">
            <div className="chat-header">
                <h1 className="chat-title">SellMyRide Chat</h1>
                <div className="chat-header-user">
                    <span>{user.name}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </div>

            <div className="chat-container">
                <UserList
                    onSelectUser={handleSelectUser}
                    selectedUserId={selectedUser?.id}
                />
                <ChatWindow
                    currentUser={user}
                    selectedUser={selectedUser}
                    conversation={conversation}
                />
            </div>
        </div>
    );
}
