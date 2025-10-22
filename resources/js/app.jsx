import { createRoot } from "react-dom/client";
import ChatApp from "./components/ChatApp";

const root = createRoot(document.getElementById("app"));
root.render(<ChatApp />);
