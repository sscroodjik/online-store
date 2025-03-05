const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');  // Для генерации уникальных идентификаторов

const PORT = 9070;
const wss = new WebSocket.Server({ port: PORT });

// Храним сообщения только для текущего сеанса
let messages = [];

wss.on('connection', (ws) => {
    // Генерация уникального ID для нового клиента
    const userId = uuidv4();
    console.log(`🔌 Новый пользователь подключился`);

    // Отправляем приветственное сообщение и уникальный ID
    ws.send(`Добро пожаловать!`);

    // Очищаем историю сообщений при каждом новом подключении
    messages = [];  // Все сообщения очищаются при подключении нового пользователя

    // Сообщаем подключенному пользователю о новом сообщении, если оно есть
    messages.forEach(msg => ws.send(`${msg.time} | ${msg.user}: ${msg.text}`));

    // Обработка входящих сообщений от клиента
    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        const newMessage = {
            user: msg.user || 'Аноним',
            text: msg.text,
            time: new Date().toLocaleTimeString(),
        };

        // Добавляем новое сообщение в память
        messages.push(newMessage);
        console.log(`💬 ${newMessage.user}: ${newMessage.text}`);

        // Отправляем новое сообщение всем подключенным клиентам
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`${newMessage.time} | ${newMessage.user}: ${newMessage.text}`);
            }
        });
    });

    // Обработка отключения клиента
    ws.on('close', () => {
        console.log(`💔 Пользователь с ID ${userId} отключился`);
    });
});

console.log(`💬 WebSocket сервер работает на ws://localhost:${PORT}`);
