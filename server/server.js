const express = require('express');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const cors = require('cors');

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- API Endpoints ---

// GET /api/menu - Get all menu items with their options
app.get('/api/menu', async (req, res) => {
  try {
    const menuQuery = `
      SELECT m.*, array_agg(o.id) as option_ids
      FROM menu_items m
      LEFT JOIN menu_item_options mo ON m.id = mo.menu_item_id
      LEFT JOIN options o ON mo.option_id = o.id
      GROUP BY m.id
      ORDER BY m.id;
    `;
    const optionsQuery = 'SELECT * FROM options;';

    const [menuResult, optionsResult] = await Promise.all([
      pool.query(menuQuery),
      pool.query(optionsQuery),
    ]);

    const optionsMap = new Map(optionsResult.rows.map(o => [o.id, o]));

    const menu = menuResult.rows.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image_url,
      isSoldOut: item.stock_quantity === 0,
      options: (item.option_ids || []).filter(id => id).map(id => ({
        id: optionsMap.get(id).id,
        name: optionsMap.get(id).name,
        priceDelta: optionsMap.get(id).price_delta,
      })),
    }));

    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/orders - Create a new order
app.post('/api/orders', async (req, res) => {
  const { items, totalPrice } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'INSERT INTO orders (total_price, status) VALUES ($1, $2) RETURNING id',
      [Math.round(totalPrice), 'pending']
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const menuItem = await client.query('SELECT price FROM menu_items WHERE id = $1', [item.menuItemId]);
      let unitPrice = menuItem.rows[0].price;
      
      if (item.options && item.options.length > 0) {
        const optionsPriceResult = await client.query('SELECT SUM(price_delta) as total FROM options WHERE id = ANY($1::int[])', [item.options]);
        unitPrice += parseInt(optionsPriceResult.rows[0].total, 10);
      }

      const orderItemResult = await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING id',
        [orderId, item.menuItemId, item.quantity, unitPrice]
      );
      const orderItemId = orderItemResult.rows[0].id;

      if (item.options && item.options.length > 0) {
        const optionValues = item.options.map(optId => `(${orderItemId}, ${optId})`).join(',');
        await client.query(`INSERT INTO order_item_options (order_item_id, option_id) VALUES ${optionValues}`);
      }
      
      await client.query('UPDATE menu_items SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.menuItemId]);
    }

    await client.query('COMMIT');
    res.status(201).json({ orderId, message: '주문이 성공적으로 접수되었습니다.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// --- Admin API ---

// GET /api/admin/stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const query = `
            SELECT
                COUNT(*) AS "totalOrders",
                COUNT(*) FILTER (WHERE status = 'pending') AS "pending",
                COUNT(*) FILTER (WHERE status = 'inProgress') AS "inProgress",
                COUNT(*) FILTER (WHERE status = 'completed') AS "completed"
            FROM orders;
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/admin/inventory
app.get('/api/admin/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, stock_quantity as "stockQuantity" FROM menu_items ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/admin/inventory/:id
app.patch('/api/admin/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE menu_items SET stock_quantity = $1 WHERE id = $2 RETURNING id, name, stock_quantity as "stockQuantity"',
      [quantity, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/orders
app.get('/api/admin/orders', async (req, res) => {
    const { status } = req.query;
    try {
        let query = `
            SELECT o.id, o.created_at AS "createdAt", o.total_price AS "totalPrice", o.status,
                   json_agg(json_build_object('name', mi.name, 'quantity', oi.quantity)) as items
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.id
        `;
        const params = [];
        if (status) {
            query += ' WHERE o.status = $1';
            params.push(status);
        }
        query += ' GROUP BY o.id ORDER BY o.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH /api/admin/orders/:id/status
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();

  // Only handle stock for 'inProgress' status change
  if (status === 'inProgress') {
    try {
      await client.query('BEGIN');

      // 1. Get all items for the order
      const itemsResult = await client.query(
        'SELECT oi.quantity, oi.menu_item_id, mi.name as menu_name, mi.stock_quantity FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1',
        [id]
      );
      const orderItems = itemsResult.rows;

      // 2. Check stock for all items
      for (const item of orderItems) {
        if (item.stock_quantity < item.quantity) {
          throw new Error(`재고 부족: ${item.menu_name}`);
        }
      }

      // 3. Decrement stock for all items
      for (const item of orderItems) {
        await client.query(
          'UPDATE menu_items SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.menu_item_id]
        );
      }

      // 4. Update order status
      const result = await client.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
        [status, id]
      );

      await client.query('COMMIT');
      res.json({ orderId: result.rows[0].id, newStatus: result.rows[0].status });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      // Check for our specific stock error
      if (err.message.startsWith('재고 부족')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } else {
    // For other status changes (e.g., 'completed'), just update the status
    try {
      const result = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
        [status, id]
      );
      res.json({ orderId: result.rows[0].id, newStatus: result.rows[0].status });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});


app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});