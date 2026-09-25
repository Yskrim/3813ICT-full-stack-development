// Задание 3 — права доступа и защита от подделки канала
// Конспект: 6-6-Socket-io-rooms.md (workflow с проверкой прав)
// Запуск: npm run rooms:3
//   http://localhost:3000/?user=anton  — есть доступ к 'secret'
//   http://localhost:3000/?user=guest  — доступа к 'secret' нет

const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
app.use(express.static(join(__dirname, 'public')));

const server = createServer(app);
const io = new Server(server);

// Правила доступа: в реальном проекте это придёт из базы
const ACCESS = {
    general: null,          // null = открыт всем
    secret: ['anton']
};

function canAccess(user, channelId) {
    // TODO: вернуть false для неизвестного канала,
    // true если ACCESS[channelId] === null,
    // иначе проверить, есть ли user в списке
    return false;
}

// TODO: io.use((socket, next) => { ... })
//   - прочитать socket.handshake.auth.user
//   - если имени нет → next(new Error('unauthorized'))
//   - иначе положить в socket.data.user и вызвать next()

io.on('connection', (socket) => {
    console.log('подключился', socket.data.user, socket.id);

    socket.on('join-channel', (channelId) => {
        // TODO: проверить право через canAccess. При отказе:
        //   отправить 'join-denied' с названием канала и ВЫЙТИ, не заходя в комнату
        // TODO: при успехе — выйти из предыдущего канала, войти в новый,
        //   запомнить его в socket.data.channelId, подтвердить событием 'joined',
        //   уведомить комнату событием 'user-joined'
    });

    socket.on('message', (text) => {
        // TODO: взять канал ИЗ socket.data.channelId (никогда не из данных клиента!)
        // TODO: если канала нет — выйти
        // TODO: разослать 'new-message' в этот канал
    });

    socket.on('disconnecting', () => {
        // TODO: пока комнаты ещё доступны, уведомить каждую (кроме комнаты socket.id)
        // событием 'user-left' с именем пользователя
    });
});

server.listen(3000, () => console.log('сервер слушает http://localhost:3000'));

// Проверка «взлома»: открой окно с ?user=guest и выполни в консоли браузера
//   socket.emit('join-channel', 'secret')
// В логе должно появиться [join-denied] secret
