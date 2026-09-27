import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import socket from "./socket";
socket.on("connect", () => {
  console.log("🔌 Connected to Socket.io:", socket.id);
});

import App from "./App.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
import { store } from "./store/store.js";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);