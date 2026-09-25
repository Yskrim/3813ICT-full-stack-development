// Задание 1 — обернуть колбэчный API в промис
// Конспект: 6-2-Promises-and-async-functions.md
// Запуск: node 03-promises/task-1-promisify.ts

type User = { id: number; name: string };

// Колбэчный API — НЕ меняй его, представь, что это чужая библиотека
function findUser(id: number, callback: (err: Error | null, user?: User) => void): void {
    console.log('[api] пошёл искать пользователя', id);
    setTimeout(() => {
        if (id === 0) {
            callback(new Error('пользователь не найден'));
            return;
        }
        callback(null, { id, name: 'user-' + id });
    }, 100);
}

function findUserAsync(id: number): Promise<User> {
    // TODO: обернуть findUser в new Promise.
    // Успех → resolve(user), ошибка → reject(err)
    throw new Error('не реализовано');
}

async function main(): Promise<void> {
    // Порядок из конспекта: синхронный код, потом микрозадачи
    console.log('1');
    Promise.resolve().then(() => console.log('2'));
    console.log('3');
    await new Promise((resolve) => setTimeout(resolve, 0));

    // TODO: получить пользователя 7 через await и напечатать '[ok]' и его name

    // TODO: получить пользователя 0, поймать ошибку через try/catch
    // и напечатать '[fail]' и err.message
}

main();
