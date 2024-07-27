const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const path = require('path');

const app = express();

// Path to SSL certificate and key files
const options = {
    key: fs.readFileSync('/home/ubuntu/LLMPoweredVirtualAgent-G78-PS24/key.pem'),
    cert: fs.readFileSync('/home/ubuntu/LLMPoweredVirtualAgent-G78-PS24/cert.pem'),
};

const server = https.createServer(options, app);
const io = socketIo(server);

app.use(express.static('public'));

// To store the admin socket
let adminSocket = null;
const adminId = 'admin123'; // sample admin ID

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('adminLogin', (inputAdminId) => {
        if (inputAdminId === adminId) {
            adminSocket = socket;
            console.log('Admin logged in');
            socket.emit('adminLoginSuccess');
        } else {
            socket.emit('adminLoginFailure', 'Invalid admin ID');
        }
    });

    socket.on('login', () => {
        console.log('User logged in');
        socket.emit('loginSuccess');
    });

    socket.on('offer', (offer) => {
        if (adminSocket) {
            adminSocket.emit('offer', offer);
        } else {
            socket.emit('adminNotAvailable');
        }
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
        socket.broadcast.emit('candidate', candidate);
    });

    socket.on('endCall', () => {
        socket.broadcast.emit('endCall');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        if (socket === adminSocket) {
            adminSocket = null;
        }
    });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Replace with your local IP address

server.listen(PORT, HOST, () => {
    console.log(`Server is running on https://${HOST}:${PORT}`);
});
