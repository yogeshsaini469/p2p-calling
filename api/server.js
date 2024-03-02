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
  try {
    // Parse the request body as JSON
    const body = JSON.parse(req.body);
    const eventType = body.eventType;
    const payload = body.payload;

    // Handle socket.io events based on the event type
    if (eventType === 'connection') {
      io.emit('connection', payload);
    } else if (eventType === 'sdp') {
      io.emit('sdp', payload);
    } else if (eventType === 'candidate') {
      io.emit('candidate', payload);
    } else {
      // Unknown event type
      throw new Error('Unknown event type');
    }

    // Send a success response
    res.status(200).send('Success');
  } catch (error) {
    // Handle errors and send an error response
    console.error('Error handling socket.io event:', error);
    res.status(500).send('Internal Server Error');
  }
};
