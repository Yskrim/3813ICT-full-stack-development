// Задание 3 — модульный сервер и CORS: точка входа
// Конспект: 6-5-Sockets-coding-example.md (три файла, два разных CORS)
// Запуск: npm run sockets:3 (во втором терминале: npm run sockets:3-client)

const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();

// TODO: подключить cors() и express.json() для обычных HTTP-маршрутов

const server = createServer(app);

// TODO: создать io. СНАЧАЛА запусти без опции cors и посмотри консоль браузера.
// Потом добавь: { cors: { origin: 'http://localhost:4200' } }
const io = new Server(server);

// TODO: подключить логику из ./socket.js, передав io
// TODO: подключить запуск из ./listen.js, передав server

// TODO: напиши здесь своими словами, чем app.use(cors()) отличается
// от опции cors у new Server(...):
// →
