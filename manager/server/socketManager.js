const { Server } = require("socket.io");

let io = null;

function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3001", // Allow manager client origin (running on 3001)
      methods: ["GET", "POST"] // Allowed methods for CORS
    }
  });
  console.log('Socket.IO initialized');
  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIo,
}; 