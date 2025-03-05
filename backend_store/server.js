const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 9040;

// Файл с товарами на сервере для пользователя
const productsFile = path.join(__dirname, 'products.json');

// Настройка CORS и JSON
app.use(cors());
app.use(express.json());

// Чтение товаров с сервера для пользователя (получение товаров)
const loadProducts = () => {
    const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    return data.products || [];
};

// Получение всех товаров (без редактирования и удаления)
app.get('/products', (req, res) => {
    res.json(loadProducts());
});

// Запуск сервера и вывод сообщения в консоль
app.listen(PORT, () => {
    console.log(`🔥 Сервер для пользователя запущен на http://localhost:${PORT}`);
});
