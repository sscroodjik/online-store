const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const PORT = 9080;

app.use(cors());
app.use(express.json());

const productsFile = path.join(__dirname, 'products.json');

// Функция загрузки товаров
const loadProducts = () => {
    if (fs.existsSync(productsFile)) {
        const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        return data.products || [];
    }
    return [];
};

// GraphQL схема (удалены Mutation для админки)
const schema = buildSchema(`
    type Product {
        id: ID
        name: String
        price: Int
        description: String
        categories: [String]
    }

    type Query {
        products(fields: [String]): [Product]
        product(id: ID!): Product
    }
`);

// Фильтрация полей для вывода только нужной информации
const filterFields = (product, fields) => {
    if (!fields || fields.length === 0) return product;
    let filtered = {};
    fields.forEach(field => {
        if (product[field]) {
            filtered[field] = product[field];
        }
    });
    return filtered;
};

const root = {
    products: ({ fields }) => {
        const products = loadProducts();
        return products.map(p => filterFields(p, fields));
    },
    product: ({ id }) => {
        const product = loadProducts().find(p => p.id == id);
        return product || null;
    }
};

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}));

app.listen(PORT, () => {
    console.log(`🔥 GraphQL сервер запущен на http://localhost:${PORT}`);
});
