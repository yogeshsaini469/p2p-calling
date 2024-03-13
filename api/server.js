// Import necessary modules
const { Server } = require("socket.io");
const { createServer } = require("@vercel/node");

// Create the Socket.IO server
const io = new Server();

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
    socket.broadcast.emit("sdp", data);
  });

  socket.on("candidate", (data) => {
    socket.broadcast.emit("candidate", data);
  });

  socket.on("callEnded", () => {
    console.log("Call ended");
    io.emit("callEnded");
  });
});

// Export the serverless function
module.exports = (req, res) => {
  // Handling HTTP requests
  if (req.url === "/webrtc" && req.method === "GET") {
    // Handle GET request to /webrtc
    res.status(200).send("Hello, WebRTC!!!!!!!");
  } else {
    // For other routes or methods, return 404
    res.status(404).send("Not found");
  }
};

// Initialize the Socket.IO server
io.attach(createServer());
