# 0 — Подготовка

**Время:** 15–20 минут
**Дальше:** [1 — Observer и Subject руками](../01-observer-subject/README.md)

## Задача

Для вечера нужны Angular-клиент и Node-сервер с Socket.IO. Если у тебя есть проект `chat-practice` из практики недели 5, работай в нём — добавь только то, чего не хватает. Если нет, создай новый по шагам ниже. Здесь ничего не тренируется, поэтому код дан целиком.

## Шаг 1. Angular

```bash
ng new chat-rt --style=css --ssr=false     # пропусти, если работаешь в chat-practice
cd chat-rt
npm install socket.io-client
ng g c pages/lab                           # площадка для заданий 1 и 2
```

Маршрут `{ path: 'lab', component: LabComponent }` в `app.routes.ts` и ссылка на него в корневом шаблоне рядом с `<router-outlet />`.

## Шаг 2. Сервер

```bash
mkdir server && cd server
npm init -y
npm install express cors socket.io
```

В `server/package.json`:

```json
"scripts": {
  "dev": "node --watch server.js"
}
```

`server/server.js`:

```js
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = 3000;
const CLIENT_ORIGIN = 'http://localhost:4200';

const app = express();
const httpServer = createServer(app);                 // один HTTP-сервер для Express и Socket.IO
const io = new Server(httpServer, { cors: { origin: CLIENT_ORIGIN } });

app.use(cors({ origin: CLIENT_ORIGIN }));             // CORS для HTTP-маршрутов
app.use(express.json());

// Каждый HTTP-запрос — в консоль: пригодится в задании 2
app.use((req, res, next) => {
  console.log(new Date().toLocaleTimeString(), req.method, req.url);
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/slow', (req, res) => setTimeout(() => res.json({ ok: true, slow: true }), 1500));

// Сокеты — в задании 3
io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);
});

httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}`));
```

## Проверка

- [ ] `npm run dev` в `server` → http://localhost:3000/api/health отвечает `{ "ok": true }`
- [ ] `ng serve` → http://localhost:4200/lab открывает площадку
