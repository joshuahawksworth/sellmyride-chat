import { useState, useEffect } from "react";
import api from "../api";

export default function UserList({ onSelectUser, selectedUserId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="user-list-loading">Loading users...</div>;
    }

    return (
        <div className="user-list">
            <h2 className="user-list-title">Users</h2>
            <div className="user-list-items">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className={`user-item ${
                            selectedUserId === user.id ? "active" : ""
                        }`}
                        onClick={() => onSelectUser(user)}
                    >
                        <div className="user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
