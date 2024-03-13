const { Server } = require("socket.io");

module.exports = (req, res) => {
    if (!res.socket.server.io) {
        console.log("First use, starting socket.io");

        const io = new Server(res.socket.server);

        io.of('/webRTCPeers').on('connection', (socket) => {
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

        res.socket.server.io = io;
    }

    res.end();
};
