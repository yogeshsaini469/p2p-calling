// /api/server.js

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => res.send('Hello, WebRTC!!!!!!!'));

io.of('/webRTCPeers').on('connection', socket => {
    console.log(socket.id);

    socket.emit('connection-success', {
        status: 'connection-success',
        socketId: socket.id,
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected.`);
    });

    socket.on('sdp', data => {
        socket.broadcast.emit('sdp', data);
    });

    socket.on('candidate', data => {
        socket.broadcast.emit('candidate', data);
    });

    socket.on('callEnded', () => {
        console.log('Call ended');
        io.of('/webRTCPeers').emit('callEnded');
    });
});

module.exports = app;
