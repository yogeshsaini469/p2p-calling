const express = require('express');
const http = require('http'); // Import http module to create HTTP server

const app = express();
const server = http.createServer(app); // Create HTTP server using Express app

const io = require('socket.io')(server, {
    path: '/webrtc'
});

const port = 8080;
app.get('/', (req, res) => res.send('Hello, WebRTC!!!!!!!'));

server.listen(port, () => {
    console.log(`WebRTC App is listening on port ${port}`);
});

const webRTCNamespace = io.of('/webRTCPeers');

webRTCNamespace.on('connection', socket => {
    console.log(socket.id);

    socket.emit('connection-success', {
        status: 'connection-success',
        socketId: socket.id,
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected.`);
    });

    socket.on('sdp', data => {
        socket.broadcast.emit('sdp', data)
    })

    socket.on('candidate', data => {
        socket.broadcast.emit('candidate', data)
    })
    socket.on('callEnded', () => {
        console.log('Call ended');
        webRTCNamespace.emit('callEnded');
    });
});
