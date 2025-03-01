import { useEffect } from "react";
import { io } from "socket.io-client";
let socket;

const Socket = () => {
  useEffect(() => socketInitializer(), []);

  const socketInitializer = async () => {
    socket = await io(window.location.origin + "/api/socket", {
      transports: ["websocket"],
      autoConnect: true,
    });
    

    socket.on("connect", () => {
      console.log("connected");
    });
  };

  return null;
};

export default Socket;
