# 00 — Подготовка проекта

**Время:** 20–30 минут
**Дальше:** [1.1 — Хранилища в консоли](../01-storage/01-console-storage/README.md)

## Задача

Все задания недели делаются в одном проекте — **chat-practice**. Так они складываются в приложение, а не остаются набором разрозненных упражнений. Сейчас создадим его каркас: Angular-клиент и папку сервера рядом, внутри одного репозитория (так же, как в [5_6 §2](../materials/5_6-node-angular-konspekt.md#s2)).

Здесь нет ничего, что нужно тренировать, поэтому все команды и код даны целиком. Просто пройди шаги по порядку.

## Шаг 1. Angular-проект

Создай проект **рядом** с папкой бандла (не внутри неё):

```bash
ng new chat-practice --style=css --ssr=false
cd chat-practice
```

`--ssr=false` отключает серверный рендеринг: для учебного чата он не нужен и только усложнит работу с localStorage ([5_1 П-5](../materials/5_1-data-persistence-popravki.md#p-5)).

Проверь, как CLI называет файлы: если корневой компонент лежит в `src/app/app.ts`, то проект создан в Angular 20 или новее, и суффиксы `.service`, `.component` по умолчанию не добавляются ([5_2 §3.2](../materials/5_2-services-konspekt.md#s3-2)). В заданиях классы названы с суффиксами (`StorageService`, `LoginComponent`) — так нагляднее, и не возникает конфликтов имён: например, сервис без суффикса `Storage` совпал бы со встроенным типом браузера. Чтобы CLI добавлял суффиксы, допиши в `angular.json` внутрь `projects.chat-practice`:

```json
"schematics": {
  "@schematics/angular:component": { "type": "component" },
  "@schematics/angular:service": { "type": "service" },
  "@schematics/angular:directive": { "type": "directive" }
}
```

## Шаг 2. Площадка для экспериментов

Некоторые задания — короткие опыты. Для них заведём отдельную страницу:

```bash
ng g c pages/playground
```

В `src/app/app.routes.ts`:

```ts
import { Routes } from '@angular/router';
import { PlaygroundComponent } from './pages/playground/playground.component';

export const routes: Routes = [
  { path: 'playground', component: PlaygroundComponent },
];
```

В шаблоне корневого компонента (`app.html` или `app.component.html`) оставь только навигацию и `<router-outlet />`:

```html
<nav>
  <a routerLink="/playground">Площадка</a>
</nav>
<router-outlet />
```

Проверь, что в `imports` корневого компонента есть `RouterOutlet` и `RouterLink` из `@angular/router`.

## Шаг 3. Сервер

```bash
mkdir server && cd server
npm init -y
npm install express
```

В `server/package.json` добавь скрипты:

```json
"scripts": {
  "start": "node server.js",
  "dev": "node --watch server.js"
}
```

Создай `server/server.js`:

```js
const express = require('express');

const app = express();
app.use(express.json());

// Проверка, что сервер жив
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(3000, () => console.log('API: http://localhost:3000'));
```

## Шаг 4. Git

В корне `chat-practice` уже есть `.gitignore` от Angular. Допиши в него строку `server/node_modules/` и сделай первый коммит.

## Проверка

- [ ] `ng serve` в корне проекта → http://localhost:4200/playground показывает страницу площадки
- [ ] `npm run dev` в папке `server` → http://localhost:3000/api/health отвечает `{ "ok": true, ... }`
- [ ] Если изменить `server.js` и сохранить, сервер перезапускается сам
