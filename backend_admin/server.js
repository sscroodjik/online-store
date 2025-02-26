const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9050;

app.use(cors());
app.use(express.json());

const productsFile = path.join(__dirname, '../backend_store/products.json');

// Проверяем, существует ли файл с товарами
if (!fs.existsSync(productsFile)) {
    fs.writeFileSync(productsFile, JSON.stringify({ products: [] }, null, 2));
}

// Функция для загрузки товаров
const loadProducts = () => {
    try {
        if (fs.existsSync(productsFile)) {
            const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
            return data.products || [];
        }
        return [];
    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
        return [];
    }
};

// Функция для сохранения товаров
const saveProducts = (products) => {
    try {
        fs.writeFileSync(productsFile, JSON.stringify({ products }, null, 2));
    } catch (error) {
        console.error("Ошибка сохранения товаров:", error);
    }
};

// ✅ **1. Получение всех товаров**
app.get('/products', (req, res) => {
    const products = loadProducts();
    console.log("📦 Все товары отправлены:", products.length, "шт.");
    res.json(products);
});

// ✅ **2. Добавление товара**
app.post('/products', (req, res) => {
    try {
        const products = loadProducts();
        const newProduct = req.body;
        
        if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.categories) {
            return res.status(400).json({ message: "Ошибка: Заполните все поля!" });
        }

        newProduct.id = products.length ? products[products.length - 1].id + 1 : 1;
        products.push(newProduct);
        saveProducts(products);

        console.log("✅ Добавлен товар:", newProduct);
        res.status(201).json({ message: 'Товар добавлен', product: newProduct });
    } catch (error) {
        console.error("Ошибка добавления товара:", error);
        res.status(500).json({ message: "Ошибка сервера при добавлении товара" });
    }
});

// ✅ **3. Редактирование товара по ID**
app.put('/products/:id', (req, res) => {
    try {
        const products = loadProducts();
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            console.log(`⚠️ Ошибка: товар с ID ${productId} не найден`);
            return res.status(404).json({ message: 'Товар не найден' });
        }

        products[productIndex] = { ...products[productIndex], ...req.body };
        saveProducts(products);

        console.log("✏️ Товар обновлён:", products[productIndex]);
        res.json({ message: 'Товар обновлён', product: products[productIndex] });
    } catch (error) {
        console.error("Ошибка редактирования товара:", error);
        res.status(500).json({ message: "Ошибка сервера при редактировании товара" });
    }
});

// ✅ **4. Удаление товара по ID**
app.delete('/products/:id', (req, res) => {
    try {
        let products = loadProducts();
        const productId = parseInt(req.params.id);
        const filteredProducts = products.filter(p => p.id !== productId);

        if (products.length === filteredProducts.length) {
            console.log(`⚠️ Ошибка: товар с ID ${productId} не найден`);
            return res.status(404).json({ message: 'Товар не найден' });
        }

        saveProducts(filteredProducts);
        console.log(`🗑️ Товар с ID ${productId} удалён`);
        res.json({ message: 'Товар удалён' });
    } catch (error) {
        console.error("Ошибка удаления товара:", error);
        res.status(500).json({ message: "Ошибка сервера при удалении товара" });
    }
});

// ✅ **Запуск сервера**
app.listen(PORT, () => {
    console.log(`🚀 Admin сервер запущен на http://localhost:${PORT}`);
});
