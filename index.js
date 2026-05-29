const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const os = require('os');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let broadcaster;

io.on('connection', socket => {
    socket.on('broadcaster', () => {
        broadcaster = socket.id;
        socket.broadcast.emit('broadcaster');
    });
    
    socket.on('watcher', () => {
        socket.to(broadcaster).emit('watcher', socket.id);
    });
    
    socket.on('offer', (id, message) => {
        socket.to(id).emit('offer', socket.id, message);
    });
    
    socket.on('answer', (id, message) => {
        socket.to(id).emit('answer', socket.id, message);
    });
    
    socket.on('candidate', (id, message) => {
        socket.to(id).emit('candidate', socket.id, message);
    });
    
    socket.on('disconnect', () => {
        socket.to(broadcaster).emit('disconnectPeer', socket.id);
    });
});

const port = 3000;
http.listen(port, () => {
    // Получаем локальный IP адрес для подключения с телефона
    const interfaces = os.networkInterfaces();
    let localIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIp = iface.address;
            }
        }
    }
    
    console.log('\n======================================================');
    console.log('✅ Сервер запущен!');
    console.log(`💻 1. Откройте на этом ПК: http://localhost:${port}`);
    console.log(`📱 2. Откройте на телефоне: http://${localIp}:${port}/viewer.html`);
    console.log('======================================================\n');
});
