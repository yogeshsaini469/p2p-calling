const { Server } = require("socket.io");

// Handle socket.io connections
const handleSocketConnections = (io) => {
  io.on("connection", (socket) => {
    console.log(socket.id);

    socket.emit("connection-success", {
      status: "connection-success",
      socketId: socket.id,
    });

    socket.on("disconnect", () => {
      console.log(`${socket.id} has disconnected.`);
    });

    socket.on("sdp", (data) => {
      console.log(data);
      socket.broadcast.emit("sdp", data);
    });

    socket.on("candidate", (data) => {
      console.log(data);
      socket.broadcast.emit("candidate", data);
    });

    socket.on('callEnded', () => {
      console.log('Call ended');
      io.emit('callEnded');
    });
  });
};

// Export the serverless function handler
module.exports = async (req, res) => {
  // Initialize socket.io server
  const io = new Server();

  // Handle socket.io connections
  handleSocketConnections(io);

  // Send response for HTTP request
  res.status(200).json({ message: 'Hello from Vercel serverless function!' });
};
