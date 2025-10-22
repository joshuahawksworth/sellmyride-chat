import axios from "axios";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

console.log("Bootstrap.js loaded!");

window.axios = axios;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;
window.axios.defaults.baseURL = window.location.origin;

// Set up Pusher
window.Pusher = Pusher;

// Function to initialize Echo with current token
window.initializeEcho = () => {
    const token = localStorage.getItem("token");

    console.log("Initializing Echo with token:", token ? "present" : "missing");

    if (window.Echo) {
        window.Echo.disconnect();
    }

    window.Echo = new Echo({
        broadcaster: "pusher",
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,
        authEndpoint: `${window.location.origin}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        },
    });

    console.log("Echo initialized");
};

// Initialize on load if token exists
if (localStorage.getItem("token")) {
    window.initializeEcho();
}
