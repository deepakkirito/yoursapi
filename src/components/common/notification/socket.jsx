"use client"; // Required for Next.js Client Component

import { useEffect } from "react";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import socket from "@/utilities/helpers/socket";
import { showNotification } from ".";

const SocketNotification = () => {
  const [user] = useLocalStorage("user");

  useEffect(() => {
    if (!user?.email) return; // Ensure user is loaded before connecting

    connectToSocket();
    // socket.emit("register", user.email);

    // ✅ Attach the event listeners
    socket.on("register", (data) => {
      showNotification({ content: data.message });
    });

    socket.on("notification", (data) => {
        console.log(data);
      showNotification({ content: data.message, type: data.type });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from socket");
    });
  }, [user]);

  const connectToSocket = () => {
    if (socket.connected) return;
    socket.connect();
  };

  return <div></div>;
};

export default SocketNotification;
