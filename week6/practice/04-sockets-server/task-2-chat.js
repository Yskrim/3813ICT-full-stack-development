// Задание 2 — чат и выбор способа рассылки
// Конспект: 6-3-Sockets.md (таблица «кто что получает»), 6-5 (неточность слайда 3)
// Запуск: npm run sockets:2 → открыть http://localhost:3000 в ДВУХ окнах

const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
app.use(express.static(join(__dirname, 'public')));

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('клиент подключился:', socket.id);

    socket.on('message', (text) => {
        const message = {
            author: socket.id.slice(0, 4),
            text
        };

        // TODO шаг 1: разослать через io.emit('new-message', message)
        //   Проверь в двух окнах с ВКЛЮЧЁННОЙ галочкой «добавлять локально».
        //   Что видит автор сообщения? Запиши ответ здесь:
        //   →

        // TODO шаг 2: заменить на socket.broadcast.emit('new-message', message)
        //   Проверь в двух окнах с ВЫКЛЮЧЕННОЙ галочкой. Что видит автор?
        //   →

        // TODO шаг 3: оставить подходящий вариант, второй закомментировать
        //   и написать здесь, в каком случае нужен какой:
        //   →
    });

    socket.on('disconnect', (reason) => {
        console.log('клиент ушёл:', socket.id, reason);
    });
});

server.listen(3000, () => console.log('сервер слушает http://localhost:3000'));
