// Задание 1 — эхо-сервер
// Конспект: 6-3-Sockets.md (минимальный рабочий код)
// Запуск: npm run sockets:1 → открыть http://localhost:3000

const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();

// TODO: отдать статику из папки public
// подсказка: app.use(express.static(join(__dirname, 'public')))

// TODO: создать http-сервер из app и повесить на него socket.io

// TODO: io.on('connection', (socket) => { ... })
//   - напечатать 'клиент подключился:' и socket.id
//   - socket.on('message', ...) → ответить ТОЛЬКО этому клиенту событием 'echo'
//   - socket.on('disconnect', (reason) => ...) → напечатать, кто ушёл и почему

// TODO: server.listen(3000, ...) с сообщением 'сервер слушает http://localhost:3000'
