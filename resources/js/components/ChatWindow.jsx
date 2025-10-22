import { useState, useEffect, useRef } from "react";
import api from "../api";

export default function ChatWindow({
    currentUser,
    selectedUser,
    conversation,
}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (conversation) {
            fetchMessages();
            subscribeToChannel();
        }

        return () => {
            if (conversation) {
                unsubscribeFromChannel();
            }
        };
    }, [conversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/conversations/${conversation.id}/messages`
            );
            setMessages(response.data);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToChannel = () => {
        if (!window.Echo) {
            console.error("Echo is not initialized");
            return;
        }
        window.Echo.channel(`conversation.${conversation.id}`).listen(
            ".message.sent",
            (e) => {
                setMessages((prev) => [...prev, e]);
            }
        );
    };

    const unsubscribeFromChannel = () => {
        window.Echo.leave(`conversation.${conversation.id}`);
    };
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await api.post(
                `/conversations/${conversation.id}/messages`,
                {
                    message: newMessage,
                }
            );

            setMessages((prev) => [...prev, response.data]);
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (!selectedUser) {
        return (
            <div className="chat-window-empty">
                <p>Select a user to start chatting</p>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-window-header">
                <div className="user-avatar">
                    {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="chat-window-title">{selectedUser.name}</div>
                    <div className="chat-window-subtitle">
                        {selectedUser.email}
                    </div>
                </div>
            </div>

            <div className="chat-messages">
                {loading ? (
                    <div className="chat-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${
                                message.user_id === currentUser.id
                                    ? "sent"
                                    : "received"
                            }`}
                        >
                            <div className="message-content">
                                <div className="message-sender">
                                    {message.user.name}
                                </div>
                                <div className="message-text">
                                    {message.message}
                                </div>
                                <div className="message-time">
                                    {new Date(
                                        message.created_at
                                    ).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="btn-send"
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </form>
        </div>
    );
}
