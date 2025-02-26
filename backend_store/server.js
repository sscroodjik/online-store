const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 5500;

// Разрешаем CORS (если фронтенд отдельно)
const cors = require('cors');
app.use(cors());

// Загружаем товары из файла
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// Роут для получения списка товаров
app.get('/products', (req, res) => {
    res.json(products);
});
app.post('/products', (req, res) => {
    const newProduct = req.body; // Получаем данные из запроса

    if (!newProduct.name || !newProduct.price || !newProduct.description) {
        return res.status(400).json({ error: 'Необходимо указать name, price и description' });
    }

    // Присваиваем ID новому товару
    newProduct.id = products.length ? products[products.length - 1].id + 1 : 1;

    // Добавляем товар в массив
    products.push(newProduct);

    // Записываем обновленный список товаров в файл
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

    res.status(201).json({ message: 'Товар добавлен', product: newProduct });
});
// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
