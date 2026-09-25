// Задание 3 — последовательно против параллельно
// Конспект: 6-2-Promises-and-async-functions.md (Promise.all, allSettled)
// Запуск: node 03-promises/task-3-parallel.ts

function loadResource(label: string, ms: number): Promise<string> {
    return new Promise((resolve) => setTimeout(() => resolve(label), ms));
}

function failingResource(ms: number): Promise<string> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('сервер недоступен')), ms));
}

// Округление, чтобы вывод был стабильным
function roundMs(start: number): number {
    return Math.round((Date.now() - start) / 100) * 100;
}

// Три независимых ресурса, которые нужны экрану чата:
//   loadResource('каналы', 100)
//   loadResource('сообщения', 300)
//   loadResource('пользователи', 100)

async function sequential(): Promise<void> {
    const start = Date.now();
    // TODO: загрузить все три через три await подряд
    console.log('последовательно:', '~' + roundMs(start), 'мс');
}

async function parallel(): Promise<void> {
    const start = Date.now();
    // TODO: те же три через Promise.all, результаты забрать деструктуризацией
    console.log('параллельно:', '~' + roundMs(start), 'мс');
}

async function allFailsTogether(): Promise<void> {
    // TODO: Promise.all из двух рабочих ресурсов и одного failingResource,
    // поймать ошибку и напечатать 'Promise.all упал целиком:' и err.message
}

async function settled(): Promise<void> {
    // TODO: те же три через Promise.allSettled,
    // напечатать 'allSettled:' и статусы через запятую
}

async function main(): Promise<void> {
    await sequential();
    await parallel();
    await allFailsTogether();
    await settled();
}

main();
