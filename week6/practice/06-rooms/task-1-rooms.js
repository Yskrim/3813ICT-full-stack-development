// Задание 1 — вход в канал и рассылка внутрь комнаты
// Конспект: 6-6-Socket-io-rooms.md
// Запуск: npm run rooms:1 → http://localhost:3000/?user=anton и ?user=guest

const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
app.use(express.static(join(__dirname, 'public')));

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    const user = socket.handshake.auth.user || 'guest';
    socket.data.user = user;
    console.log('подключился', user, socket.id);
    console.log('его комнаты сразу после подключения:', socket.rooms);

    socket.on('join-channel', (channelId) => {
        // TODO: если сокет уже в канале (socket.data.channelId) — выйти из него
        // TODO: войти в новый канал и запомнить его в socket.data.channelId
        // TODO: напечатать socket.rooms
        // TODO: подтвердить вход отправителю событием 'joined'
        // TODO: уведомить остальных в канале событием 'user-joined'
    });

    socket.on('message', (text) => {
        // TODO: если канал не выбран — просто выйти (ничего не рассылать)
        // TODO: разослать 'new-message' с { author: user, text } в комнату этого сокета.
        //   Сравни socket.to(...) и io.to(...) и оставь осознанный выбор:
        //   →
    });

    socket.on('disconnect', (reason) => {
        console.log('ушёл', user, socket.id, reason);
    });
});

server.listen(3000, () => console.log('сервер слушает http://localhost:3000'));
