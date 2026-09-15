// Задание 2 — личные сообщения через комнату socket.id
// Конспект: 6-6-Socket-io-rooms.md (каждый сокет лежит в комнате со своим id)
// Запуск: npm run rooms:2 → открой ТРИ окна, чтобы проверить, что третье не видит личных

const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
app.use(express.static(join(__dirname, 'public')));

const server = createServer(app);
const io = new Server(server);

function broadcastClients() {
    // TODO: собрать id всех подключённых сокетов и разослать всем событием 'clients'
    // подсказка: io.sockets.sockets — это Map, её ключи и есть socket.id
}

io.on('connection', (socket) => {
    socket.data.user = socket.handshake.auth.user || 'guest';
    console.log('подключился', socket.data.user, socket.id, socket.rooms);

    // TODO: разослать обновлённый список клиентов

    socket.on('private-message', (payload) => {
        // payload = { to, text }
        // TODO: проверить, что такой сокет ещё существует (io.sockets.sockets.has(to)),
        //   иначе отправить отправителю событие 'private-failed' с пояснением
        // TODO: доставить сообщение ТОЛЬКО получателю, отправив в комнату с его id
        // TODO: подтвердить отправителю доставку событием 'private-sent'
    });

    socket.on('disconnect', () => {
        console.log('ушёл', socket.data.user, socket.id);
        // TODO: разослать обновлённый список клиентов
    });
});

server.listen(3000, () => console.log('сервер слушает http://localhost:3000'));
