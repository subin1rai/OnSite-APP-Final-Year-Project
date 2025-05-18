import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

// Create Socket Context
const SocketContext = createContext({ socket: null });

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await SecureStore.getItemAsync("AccessToken");
        if (!token) {
          return;
        }

        console.log("Token retrieved:", token);

        // Decode JWT token to extract userId
        const decoded = jwtDecode(token);
        if (!decoded.userId) {
          console.error("UserId not found in token");
          return;
        }
        setUserId(decoded.userId);
        console.log("Extracted UserId:", decoded.userId);

        // Initialize Socket Connection
        const socket = io("https://onsite-app-final-year-project-production.up.railway.app", {
          query: {
            userId: decoded.userId,
          },
        });
        setSocket(socket);
    return () => socket.close();
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    };
    initializeSocket();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
