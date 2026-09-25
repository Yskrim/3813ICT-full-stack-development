// Задание 3 — отдельный сервер ТОЛЬКО для статики, на порту 4200.
// Он изображает Angular dev-server: страница приходит с одного origin,
// а сокет подключается к другому. Этот файл менять не нужно.

const express = require('express');
const { join } = require('node:path');

const app = express();
app.use(express.static(join(__dirname, '..', 'public')));

app.listen(4200, () => {
    console.log('клиент раздаётся на http://localhost:4200');
    console.log('сокет-сервер должен быть запущен отдельно на порту 3000');
});
