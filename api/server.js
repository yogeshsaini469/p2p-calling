const { Server } = require("socket.io");

// Initialize socket.io server
const io = new Server();

// Handle socket.io connections
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

// Export the serverless function handler
module.exports = async (req, res) => {
  // Set up socket.io connection
  io.httpServer = {
    on: (event, cb) => {
      if (event === 'request') {
        cb(req, res);
      }
    }
  };
  io.attach(io.httpServer);

  // Handle socket.io events
  await io.httpServer.emit('connection', { socket: true });

  // Send response for HTTP request
  res.status(200).json({ message: 'Hello from Vercel serverless function!' });
};
