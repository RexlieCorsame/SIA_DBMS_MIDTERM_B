// 1. Import necessary packages
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// 2. Initialize the Express app
const app = express();
const PORT = 1234;

// 3. Set up middleware
app.use(cors());
app.use(express.json());

// 4. Create a connection pool to the MySQL database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'user123',
    database: 'store_db_b'
}).promise();

// --- Reusable Error Handler ---
const handleDbError = (res, err, action) => {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'A customer with this ID or Email already exists.' });
    }
    res.status(500).json({ error: `Database error on ${action}` });
};

// 5. Create a basic test route
app.get('/', (req, res) => {
    res.send('Hello! Your server is running.');
});

// --- CUSTOMERS API ROUTES (CRUD) ---

// --- CATEGORIES API ROUTES (CRUD) ---
// CREATE category
app.post('/categories', async (req, res) => {
    try {
        const { category_id, category_name } = req.body;
        await db.query('INSERT INTO categories (category_id, category_name) VALUES (?, ?)', [category_id, category_name]);
        res.status(201).json({ message: 'Category created successfully!' });
    } catch (err) {
        handleDbError(res, err, 'create category');
    }
});
// READ all categories
app.get('/categories', async (req, res) => {
    try {
        const [data] = await db.query('SELECT * FROM categories;');
        res.json(data);
    } catch (err) {
        handleDbError(res, err, 'read categories');
    }
});
// READ single category
app.get('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [data] = await db.query('SELECT * FROM categories WHERE category_id = ?', [id]);
        data.length === 0 ? res.status(404).json({ message: 'Category not found' }) : res.json(data[0]);
    } catch (err) {
        handleDbError(res, err, 'read category');
    }
});
// UPDATE category
app.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;
        const [result] = await db.query('UPDATE categories SET category_name = ? WHERE category_id = ?', [category_name, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category updated successfully!' });
    } catch (err) {
        handleDbError(res, err, 'update category');
    }
});
// DELETE category
app.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully!' });
    } catch (err) {
        handleDbError(res, err, 'delete category');
    }
});

// --- SUPPLIERS API ROUTES (CRUD) ---
// CREATE supplier
app.post('/suppliers', async (req, res) => {
    try {
        const { supplier_id, supplier_name, country } = req.body;
        await db.query('INSERT INTO suppliers (supplier_id, supplier_name, country) VALUES (?, ?, ?)', [supplier_id, supplier_name, country]);
        res.status(201).json({ message: 'Supplier created successfully!' });
    } catch (err) {
        handleDbError(res, err, 'create supplier');
    }
});
// READ all suppliers
app.get('/suppliers', async (req, res) => {
    try {
        const [data] = await db.query('SELECT * FROM suppliers;');
        res.json(data);
    } catch (err) {
        handleDbError(res, err, 'read suppliers');
    }
});
// READ single supplier
app.get('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [data] = await db.query('SELECT * FROM suppliers WHERE supplier_id = ?', [id]);
        data.length === 0 ? res.status(404).json({ message: 'Supplier not found' }) : res.json(data[0]);
    } catch (err) {
        handleDbError(res, err, 'read supplier');
    }
});
// UPDATE supplier
app.put('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { supplier_name, country } = req.body;
        const [result] = await db.query('UPDATE suppliers SET supplier_name = ?, country = ? WHERE supplier_id = ?', [supplier_name, country, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json({ message: 'Supplier updated successfully!' });
    } catch (err) {
        handleDbError(res, err, 'update supplier');
    }
});
// DELETE supplier
app.delete('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM suppliers WHERE supplier_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json({ message: 'Supplier deleted successfully!' });
    } catch (err) {
        handleDbError(res, err, 'delete supplier');
    }
});

// Reusable function: get all suppliers and their products (LEFT JOIN)
async function getSuppliersWithProducts() {
    const sql = `
        SELECT s.supplier_id, s.supplier_name, p.product_name
        FROM suppliers s
        LEFT JOIN products p ON s.supplier_id = p.supplier_id
        ORDER BY s.supplier_id
    `;
    const [rows] = await db.query(sql);
    return rows;
}

// GET /api/suppliers/products -> list suppliers and their products (product_name may be NULL)
app.get('/api/suppliers/products', async (req, res) => {
    try {
        const rows = await getSuppliersWithProducts();
        return res.status(200).json(rows);
    } catch (err) {
        handleDbError(res, err, 'get suppliers with products');
    }
});

// --- PRODUCTS API ROUTES (CRUD) ---
// [JOIN] Get Products with Full Details
// Reusable function to get products with full details
async function getProductDetails() {
    const sql = `
        SELECT p.product_id, p.product_name, p.price, p.stock_quantity,
               c.category_name, s.supplier_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
    `;
    const [data] = await db.query(sql);
    return data;
}

// GET /api/products/details using the reusable function
app.get('/api/products/details', async (req, res) => {
    try {
        const data = await getProductDetails();
        res.json(data);
    } catch (err) {
        handleDbError(res, err, 'get product details');
    }
});
// [ADVANCED SEARCH] Find Products by Criteria
app.get('/api/products/search', async (req, res) => {
    try {
        const { name, minPrice } = req.query;
        let sql = 'SELECT * FROM products';
        const params = [];
        const conditions = [];
        if (name) {
            conditions.push('LOWER(product_name) LIKE ?');
            params.push(`%${name.toLowerCase()}%`);
        }
        if (minPrice) {
            conditions.push('price >= ?');
            params.push(Number(minPrice));
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        const [data] = await db.query(sql, params);
        res.json(data);
    } catch (err) {
        handleDbError(res, err, 'search products');
    }
});
// GET /api/products/find?name=<string> -> uses searchProductsByName helper
app.get('/api/products/find', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: 'name query parameter is required' });
        const rows = await searchProductsByName(name);
        return res.status(200).json(rows);
    } catch (err) {
        if (err.code === 'INVALID_NAME') return res.status(400).json({ error: err.message });
        handleDbError(res, err, 'search products by name');
    }
});
// --- TASK 3: /api/products ENDPOINTS ---

// [READ] Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const [data] = await db.query('SELECT * FROM products;');
        res.json(data);
    } catch (err) {
        handleDbError(res, err, 'get all products');
    }
});

// [READ] Get a Single Product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [data] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);
        if (data.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(data[0]);
    } catch (err) {
        handleDbError(res, err, 'get product by id');
    }
});

// [CREATE] Add a New Product
// Reusable function to create a product
async function createProduct(productData) {
    const { product_name, price, stock_quantity, category_id, supplier_id } = productData;
    if (!product_name || price === undefined) {
        return { error: 'product_name and price are required.' };
    }
    // Check if category_id exists if provided
    if (category_id) {
        const [cat] = await db.query('SELECT category_id FROM categories WHERE category_id = ?', [category_id]);
        if (cat.length === 0) {
            return { error: 'Invalid category_id. Category does not exist.' };
        }
    }
    // Check if supplier_id exists if provided
    if (supplier_id) {
        const [sup] = await db.query('SELECT supplier_id FROM suppliers WHERE supplier_id = ?', [supplier_id]);
        if (sup.length === 0) {
            return { error: 'Invalid supplier_id. Supplier does not exist.' };
        }
    }
    // Check if product_name is unique (if required)
    const [existing] = await db.query('SELECT product_id FROM products WHERE product_name = ?', [product_name]);
    if (existing.length > 0) {
        return { error: 'Product name already exists. Please use a unique product_name.' };
    }
    // Insert product
    try {
        const [result] = await db.query(
            'INSERT INTO products (product_name, price, stock_quantity, category_id, supplier_id) VALUES (?, ?, ?, ?, ?)',
            [product_name, price, stock_quantity || 0, category_id || null, supplier_id || null]
        );
        return { id: result.insertId, message: 'Product created successfully!' };
    } catch (err) {
        // Log detailed error for debugging
        console.error('Product creation error:', err);
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return { error: 'Foreign key constraint failed. Check category_id and supplier_id.' };
        }
        if (err.code === 'ER_DUP_ENTRY') {
            return { error: 'Duplicate entry. Product name must be unique.' };
        }
        if (err.code === 'ER_BAD_NULL_ERROR') {
            return { error: 'A required field is missing or null.' };
        }
        return { error: 'Database error: ' + err.message };
    }
}

// POST /api/products using the reusable function
app.post('/api/products', async (req, res) => {
    try {
        const result = await createProduct(req.body);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.status(201).json(result);
    } catch (err) {
        handleDbError(res, err, 'create product');
    }
});

// Reusable function: search products by name (case-insensitive)
async function searchProductsByName(name) {
    if (!name || typeof name !== 'string') {
        // Use a consistent error type that caller can handle
        const err = new Error('name must be a non-empty string');
        err.code = 'INVALID_NAME';
        throw err;
    }
    const sql = 'SELECT * FROM products WHERE LOWER(product_name) LIKE ?';
    const like = `%${name.toLowerCase()}%`;
    const [rows] = await db.query(sql, [like]);
    return rows;
}


// [UPDATE] Update an Existing Product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, price, stock_quantity, category_id, supplier_id } = req.body;
        const [result] = await db.query(
            'UPDATE products SET product_name = ?, price = ?, stock_quantity = ?, category_id = ?, supplier_id = ? WHERE product_id = ?',
            [product_name, price, stock_quantity, category_id, supplier_id, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated successfully!' });
    } catch (err) {
        handleDbError(res, err, 'update product');
    }
});

// [DELETE] Remove a Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM products WHERE product_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully!' });
    } catch (err) {
        handleDbError(res, err, 'delete product');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});





// ...existing code...




// ...existing code...