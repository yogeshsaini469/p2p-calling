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
    webRTCNamespace.emit('callEnded');
});
});

// Export the serverless function handler
module.exports = async (req, res) => {
  // Set up socket.io connection
  const { socket } = await io.parse(req);
  if (!socket) {
    res.end();
    return;
  }
  // Handle socket.io events
  io.emit(socket.id, req.body);
  res.end();
};
