// Задание 2 — цепочка .then против async/await
// Конспект: 6-2-Promises-and-async-functions.md (чейнинг, catch/finally)
// Запуск: node 03-promises/task-2-chain-vs-async.ts

type Channel = { id: string; name: string };

// Готовые «серверные» функции — не меняй
function loadChannel(id: string): Promise<Channel> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (id !== 'general') {
                reject(new Error('канал не найден'));
                return;
            }
            resolve({ id, name: 'general' });
        }, 100);
    });
}

function loadMessages(channelId: string): Promise<string[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(['привет', 'как дела']), 100);
    });
}

// Вариант 1: цепочка then
function withThen(): Promise<void> {
    // TODO: loadChannel('general') → loadMessages(канал.id) → напечатать
    // '[then] канал general, сообщений 2'
    // Добавь .catch и .finally (в finally печатать '[then] finally: спиннер выключен')
    throw new Error('не реализовано');
}

// Вариант 2: то же самое через async/await
async function withAsync(channelId: string): Promise<void> {
    // TODO: try/catch/finally, префикс [async] при успехе и [error] при ошибке
    throw new Error('не реализовано');
}

// Вариант 3: классическая ошибка — забытый return
function brokenChain(): Promise<void> {
    return loadChannel('general')
        .then((channel) => {
            loadMessages(channel.id); // ← return намеренно забыт
        })
        .then((messages) => {
            console.log('[broken] что пришло в следующий then:', messages);
        });
}

async function main(): Promise<void> {
    await withThen();
    await withAsync('general');
    await brokenChain();
    await withAsync('missing'); // здесь должна сработать ветка ошибки
}

main();
