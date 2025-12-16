import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;  // ⛔ Don't connect if no token

    // 1. Create socket instance
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      autoConnect: false,  // wait for token
    });

    // 2. Connect socket
    socketRef.current.connect();

    // 3. Authenticate immediately after connection
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);

      socketRef.current.emit("authenticate", {
        token, // 🔥 SEND TOKEN HERE
      });
    });

    // 4. Listen for authentication success
    socketRef.current.on("authenticated", (data) => {
      console.log("Socket authenticated:", data);
    });

    // 5. Listen for errors
    socketRef.current.on("error", (err) => {
      console.error("Socket error:", err);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
