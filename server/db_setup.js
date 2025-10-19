const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const setupDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting database setup...');

    // Drop existing tables to ensure a clean slate
    await client.query('DROP TABLE IF EXISTS order_item_options, order_items, orders, menu_item_options, options, menu_items CASCADE;');
    console.log('Dropped existing tables.');

    // Create tables
    await client.query(`
      CREATE TABLE menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL DEFAULT 0,
        image_url VARCHAR(255),
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE options (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        price_delta INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE menu_item_options (
        menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
        option_id INTEGER REFERENCES options(id) ON DELETE CASCADE,
        PRIMARY KEY (menu_item_id, option_id)
      );

      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        total_price INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id INTEGER REFERENCES menu_items(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price INTEGER NOT NULL
      );

      CREATE TABLE order_item_options (
        order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
        option_id INTEGER REFERENCES options(id),
        PRIMARY KEY (order_item_id, option_id)
      );
    `);
    console.log('Tables created successfully.');

    // Insert seed data
    await client.query(`
      INSERT INTO menu_items (name, description, price, stock_quantity, image_url) VALUES
        ('아메리카노 (ICE)', '시원하고 깔끔한 맛', 4000, 100, 'https://images.unsplash.com/photo-1586999883321-4b9a2cb46d53?w=500'),
        ('아메리카노 (HOT)', '따뜻하고 부드러운 맛', 4000, 100, 'https://images.unsplash.com/photo-1511920170033-f8329725c174?w=500'),
        ('카페라떼', '고소한 우유와 에스프레소의 조화', 5000, 50, 'https://images.unsplash.com/photo-1572498849232-534624c2765e?w=500'),
        ('바닐라 라떼', '달콤한 바닐라 시럽이 들어간 라떼', 5500, 30, 'https://images.unsplash.com/photo-1599399055335-14b81a6e5492?w=500');

      INSERT INTO options (name, price_delta) VALUES
        ('샷 추가', 500),
        ('시럽 추가', 0),
        ('두유로 변경', 500);
    `);
    console.log('Seed data inserted successfully.');

    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error during database setup:', err);
  } finally {
    client.release();
    pool.end();
  }
};

setupDatabase();
