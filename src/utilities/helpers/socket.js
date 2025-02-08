import { io } from "socket.io-client";

// Server URL (Change this to your actual backend URL)
const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

// Create a socket instance with auto-connect enabled
const socket = io(SERVER_URL, {
  autoConnect: false, // Auto-connect on initialization
  transports: ["websocket",], // Use WebSocket for better performance
  reconnection: true, // Enable reconnection if disconnected
  reconnectionAttempts: 5, // Retry up to 5 times
  reconnectionDelay: 3000, // Wait 3 seconds before retrying
  withCredentials: true, // Send cookies with requests
});

// Export socket instance
export default socket;
