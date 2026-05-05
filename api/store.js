import pool from './db.js';

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS customer (
    customer_id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('student', 'staff', 'teacher'),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (customer_id)
  )`,
  `CREATE TABLE IF NOT EXISTS address (
    address_id INT AUTO_INCREMENT,
    customer_id INT NOT NULL,
    street VARCHAR(150) NOT NULL,
    city VARCHAR(80) NOT NULL,
    country VARCHAR(60) NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (address_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
  )`,
  `CREATE TABLE IF NOT EXISTS category (
    category_id INT AUTO_INCREMENT,
    parent_category_id INT NULL,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (category_id),
    FOREIGN KEY (parent_category_id) REFERENCES category(category_id)
  )`,
  `CREATE TABLE IF NOT EXISTS product (
    product_id INT AUTO_INCREMENT,
    category_id INT NOT NULL,
    seller_customer_id INT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) CHECK (price > 0),
    image_url VARCHAR(255),
    product_condition ENUM('new', 'used') DEFAULT 'new',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    PRIMARY KEY (product_id),
    FOREIGN KEY (category_id) REFERENCES category(category_id),
    FOREIGN KEY (seller_customer_id) REFERENCES customer(customer_id)
  )`,
  `CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT AUTO_INCREMENT,
    product_id INT UNIQUE NOT NULL,
    quantity_in_stock INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    stock_status ENUM('in_stock', 'low', 'out'),
    last_updated DATETIME NOT NULL,
    PRIMARY KEY (inventory_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
  )`,
  `CREATE TABLE IF NOT EXISTS cart (
    cart_id INT AUTO_INCREMENT,
    customer_id INT UNIQUE NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    PRIMARY KEY (cart_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
  )`,
  `CREATE TABLE IF NOT EXISTS cart_item (
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at DATETIME NOT NULL,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT,
    customer_id INT NOT NULL,
    address_id INT NOT NULL,
    order_date DATETIME NOT NULL,
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    payment_status ENUM('unpaid', 'paid', 'refunded'),
    payment_method VARCHAR(50),
    total_amount DECIMAL(10,2),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    PRIMARY KEY (order_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (address_id) REFERENCES address(address_id)
  )`,
  `CREATE TABLE IF NOT EXISTS order_item (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
  )`,
  `CREATE TABLE IF NOT EXISTS review (
    review_id INT AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (review_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    UNIQUE (customer_id, product_id)
  )`,
];

const seedStatements = [
  `INSERT INTO customer
    (first_name, last_name, email, password_hash, phone, role, created_at, updated_at, is_active)
  VALUES
    ('Ahmed', 'Al-Qahtani', 'ahmed.qahtani@kfupm.edu.sa', 'hashed_pass_001', '0501234567', 'student', NOW(), NOW(), TRUE),
    ('Sara', 'Al-Harbi', 'sara.harbi@kfupm.edu.sa', 'hashed_pass_002', '0502345678', 'student', NOW(), NOW(), TRUE),
    ('Omar', 'Al-Dossari', 'omar.dossari@kfupm.edu.sa', 'hashed_pass_003', '0503456789', 'staff', NOW(), NOW(), TRUE),
    ('Khalid', 'Al-Fahad', 'khalid.fahad@kfupm.edu.sa', 'hashed_pass_004', '0504567890', 'teacher', NOW(), NOW(), TRUE),
    ('Noura', 'Al-Mutairi', 'noura.mutairi@kfupm.edu.sa', 'hashed_pass_005', '0505678901', 'student', NOW(), NOW(), TRUE)`,
  `INSERT INTO address
    (customer_id, street, city, country, postal_code, is_default, created_at)
  VALUES
    (1, 'KFUPM Student Housing Building 12', 'Dhahran', 'Saudi Arabia', '31261', TRUE, NOW()),
    (2, 'KFUPM Student Housing Building 18', 'Dhahran', 'Saudi Arabia', '31261', TRUE, NOW()),
    (3, 'KFUPM Staff Housing Area A', 'Dhahran', 'Saudi Arabia', '31261', TRUE, NOW()),
    (4, 'KFUPM Faculty Housing Area B', 'Dhahran', 'Saudi Arabia', '31261', TRUE, NOW()),
    (5, 'KFUPM Student Housing Building 22', 'Dhahran', 'Saudi Arabia', '31261', TRUE, NOW())`,
  `INSERT INTO category
    (parent_category_id, name, description, created_at)
  VALUES
    (NULL, 'Electronics', 'Electronic devices and accessories', NOW()),
    (NULL, 'Books', 'Textbooks and study materials', NOW()),
    (NULL, 'Stationery', 'Pens, notebooks, and office supplies', NOW()),
    (NULL, 'Clothing', 'KFUPM branded clothing items', NOW()),
    (1, 'Computer Accessories', 'Keyboards, mice, USB drives, and laptop accessories', NOW())`,
  `INSERT INTO product
    (category_id, name, description, price, image_url, is_active, created_at, updated_at)
  VALUES
    (1, 'Scientific Calculator', 'Casio scientific calculator suitable for engineering students', 85.00, 'images/calculator.jpg', TRUE, NOW(), NOW()),
    (5, 'USB Flash Drive 64GB', 'High-speed 64GB USB flash drive', 39.99, 'images/usb64.jpg', TRUE, NOW(), NOW()),
    (2, 'Calculus Textbook', 'Calculus textbook for first-year university students', 120.00, 'images/calculus_book.jpg', TRUE, NOW(), NOW()),
    (3, 'A4 Notebook', '200-page ruled notebook', 12.50, 'images/notebook.jpg', TRUE, NOW(), NOW()),
    (4, 'KFUPM Hoodie', 'Green KFUPM branded hoodie', 149.00, 'images/hoodie.jpg', TRUE, NOW(), NOW()),
    (3, 'Blue Pen Pack', 'Pack of 10 blue pens', 9.99, 'images/blue_pens.jpg', TRUE, NOW(), NOW())`,
  `INSERT INTO inventory
    (product_id, quantity_in_stock, reorder_level, stock_status, last_updated)
  VALUES
    (1, 50, 10, 'in_stock', NOW()),
    (2, 8, 10, 'low', NOW()),
    (3, 25, 5, 'in_stock', NOW()),
    (4, 100, 20, 'in_stock', NOW()),
    (5, 0, 10, 'out', NOW()),
    (6, 60, 15, 'in_stock', NOW())`,
  `INSERT INTO cart
    (customer_id, created_at, updated_at)
  VALUES
    (1, NOW(), NOW()),
    (2, NOW(), NOW()),
    (3, NOW(), NOW()),
    (4, NOW(), NOW()),
    (5, NOW(), NOW())`,
  `INSERT INTO cart_item
    (cart_id, product_id, quantity, added_at)
  VALUES
    (1, 1, 1, NOW()),
    (1, 4, 2, NOW()),
    (2, 3, 1, NOW()),
    (3, 2, 1, NOW()),
    (5, 6, 3, NOW())`,
  `INSERT INTO orders
    (customer_id, address_id, order_date, order_status, payment_status, payment_method, total_amount, created_at, updated_at)
  VALUES
    (1, 1, NOW(), 'pending', 'unpaid', 'Mada', 110.00, NOW(), NOW()),
    (2, 2, NOW(), 'processing', 'paid', 'Credit Card', 120.00, NOW(), NOW()),
    (3, 3, NOW(), 'shipped', 'paid', 'Apple Pay', 39.99, NOW(), NOW()),
    (4, 4, NOW(), 'delivered', 'paid', 'Credit Card', 149.00, NOW(), NOW()),
    (5, 5, NOW(), 'cancelled', 'refunded', 'Mada', 29.97, NOW(), NOW())`,
  `INSERT INTO order_item
    (order_id, product_id, quantity, unit_price, created_at)
  VALUES
    (1, 1, 1, 85.00, NOW()),
    (1, 4, 2, 12.50, NOW()),
    (2, 3, 1, 120.00, NOW()),
    (3, 2, 1, 39.99, NOW()),
    (4, 5, 1, 149.00, NOW()),
    (5, 6, 3, 9.99, NOW())`,
  `INSERT INTO review
    (customer_id, product_id, rating, comment, created_at, updated_at)
  VALUES
    (1, 1, 5, 'Very useful calculator for engineering courses.', NOW(), NOW()),
    (2, 3, 4, 'Good textbook, but a little expensive.', NOW(), NOW()),
    (3, 2, 5, 'Fast and reliable USB drive.', NOW(), NOW()),
    (4, 5, 4, 'Comfortable hoodie with good quality.', NOW(), NOW()),
    (5, 6, 3, 'Pens are okay for the price.', NOW(), NOW())`,
];

let setupPromise;

async function ensureColumn(tableName, columnName, definition) {
  const [[result]] = await pool.query(
    `SELECT COUNT(*) AS column_count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?`,
    [tableName, columnName],
  );

  if (Number(result.column_count) === 0) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  }
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return req.body;
}

function readPositiveInt(value, label) {
  const number = Number.parseInt(String(value), 10);

  if (!Number.isInteger(number) || number < 1) {
    const error = new Error(`${label} must be a positive number.`);
    error.statusCode = 400;
    throw error;
  }

  return number;
}

function readOptionalPositiveInt(value, label) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return readPositiveInt(value, label);
}

function readNonNegativeInt(value, label) {
  const number = Number.parseInt(String(value), 10);

  if (!Number.isInteger(number) || number < 0) {
    const error = new Error(`${label} must be zero or greater.`);
    error.statusCode = 400;
    throw error;
  }

  return number;
}

function readPaymentMethod(value) {
  const method = typeof value === 'string' ? value.trim() : 'Mada';

  if (!method || method.length > 50) {
    const error = new Error('Payment method must be 50 characters or fewer.');
    error.statusCode = 400;
    throw error;
  }

  return method;
}

function readPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    const error = new Error('Price must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  return Number(price.toFixed(2));
}

function readCondition(value) {
  const condition = typeof value === 'string' ? value.trim().toLowerCase() : 'new';

  if (!['new', 'used'].includes(condition)) {
    const error = new Error('Condition must be new or used.');
    error.statusCode = 400;
    throw error;
  }

  return condition;
}

function readString(body, key, label, maxLength) {
  const value = typeof body[key] === 'string' ? body[key].trim() : '';

  if (!value) {
    const error = new Error(`${label} is required.`);
    error.statusCode = 400;
    throw error;
  }

  if (value.length > maxLength) {
    const error = new Error(`${label} must be ${maxLength} characters or fewer.`);
    error.statusCode = 400;
    throw error;
  }

  return value;
}

function readOptionalString(body, key, maxLength) {
  if (typeof body[key] !== 'string') {
    return null;
  }

  const value = body[key].trim();
  return value ? value.slice(0, maxLength) : null;
}

function readRole(value) {
  const role = typeof value === 'string' ? value.trim() : 'student';

  if (!['student', 'staff', 'teacher'].includes(role)) {
    const error = new Error('Role must be student, staff, or teacher.');
    error.statusCode = 400;
    throw error;
  }

  return role;
}

async function setupStore() {
  if (!setupPromise) {
    setupPromise = (async () => {
      for (const statement of schemaStatements) {
        await pool.query(statement);
      }

      await ensureColumn(
        'product',
        'seller_customer_id',
        'seller_customer_id INT NULL',
      );
      await ensureColumn(
        'product',
        'product_condition',
        "product_condition ENUM('new', 'used') DEFAULT 'new'",
      );

      const [[{ customer_count }]] = await pool.query(
        'SELECT COUNT(*) AS customer_count FROM customer',
      );

      if (Number(customer_count) === 0) {
        for (const statement of seedStatements) {
          await pool.query(statement);
        }
      }
    })();
  }

  try {
    return await setupPromise;
  } catch (error) {
    setupPromise = null;
    throw error;
  }
}

async function listProducts(req, res) {
  const categoryId = readOptionalPositiveInt(req.query?.category_id, 'category_id');
  const sellerCustomerId = readOptionalPositiveInt(
    req.query?.seller_customer_id,
    'seller_customer_id',
  );
  const search = typeof req.query?.search === 'string' ? req.query.search.trim() : '';
  const params = [];
  const filters = ['p.is_active = TRUE'];

  if (categoryId) {
    filters.push('(p.category_id = ? OR c.parent_category_id = ?)');
    params.push(categoryId, categoryId);
  }

  if (search) {
    filters.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (sellerCustomerId) {
    filters.push('p.seller_customer_id = ?');
    params.push(sellerCustomerId);
  }

  const [rows] = await pool.query(
    `SELECT
      p.product_id,
      p.category_id,
      p.seller_customer_id,
      p.name,
      p.description,
      CAST(p.price AS DECIMAL(10,2)) AS price,
      p.image_url,
      COALESCE(p.product_condition, 'new') AS product_condition,
      p.is_active,
      c.name AS category_name,
      CONCAT(seller.first_name, ' ', seller.last_name) AS seller_name,
      i.quantity_in_stock,
      i.reorder_level,
      i.stock_status,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
      COUNT(r.review_id) AS review_count
    FROM product p
    JOIN category c ON c.category_id = p.category_id
    LEFT JOIN customer seller ON seller.customer_id = p.seller_customer_id
    LEFT JOIN inventory i ON i.product_id = p.product_id
    LEFT JOIN review r ON r.product_id = p.product_id
    WHERE ${filters.join(' AND ')}
    GROUP BY
      p.product_id, p.category_id, p.name, p.description, p.price, p.image_url,
      p.seller_customer_id, p.product_condition, p.is_active, c.name,
      seller.first_name, seller.last_name,
      i.quantity_in_stock, i.reorder_level, i.stock_status
    ORDER BY p.product_id`,
    params,
  );

  return res.json(rows);
}

async function createProduct(req, res) {
  const body = parseBody(req);
  const customerId = readPositiveInt(body.customer_id, 'customer_id');
  const categoryId = readPositiveInt(body.category_id, 'category_id');
  const name = readString(body, 'name', 'Product name', 150);
  const description =
    typeof body.description === 'string' ? body.description.trim() : '';
  const price = readPrice(body.price);
  const imageUrl =
    typeof body.image_url === 'string' ? body.image_url.trim().slice(0, 255) : null;
  const productCondition = readCondition(body.product_condition);
  const quantity = readPositiveInt(body.quantity || 1, 'quantity');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[customer]] = await connection.query(
      'SELECT customer_id FROM customer WHERE customer_id = ? AND is_active = TRUE',
      [customerId],
    );

    if (!customer) {
      const error = new Error('Customer was not found.');
      error.statusCode = 404;
      throw error;
    }

    const [[category]] = await connection.query(
      'SELECT category_id FROM category WHERE category_id = ?',
      [categoryId],
    );

    if (!category) {
      const error = new Error('Category was not found.');
      error.statusCode = 404;
      throw error;
    }

    const [productResult] = await connection.query(
      `INSERT INTO product
        (category_id, seller_customer_id, name, description, price, image_url, product_condition, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [
        categoryId,
        customerId,
        name,
        description,
        price,
        imageUrl,
        productCondition,
      ],
    );
    const productId = productResult.insertId;
    const stockStatus = quantity <= 0 ? 'out' : quantity <= 2 ? 'low' : 'in_stock';

    await connection.query(
      `INSERT INTO inventory
        (product_id, quantity_in_stock, reorder_level, stock_status, last_updated)
      VALUES (?, ?, 2, ?, NOW())`,
      [productId, quantity, stockStatus],
    );

    await connection.commit();

    return res.status(201).json({
      product_id: productId,
      customer_id: customerId,
      name,
      price,
      product_condition: productCondition,
      quantity_in_stock: quantity,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateProduct(req, res) {
  const body = parseBody(req);
  const productId = readPositiveInt(body.product_id || req.query?.product_id, 'product_id');
  const customerId = readPositiveInt(body.customer_id, 'customer_id');
  const categoryId = readPositiveInt(body.category_id, 'category_id');
  const name = readString(body, 'name', 'Product name', 150);
  const description =
    typeof body.description === 'string' ? body.description.trim() : '';
  const price = readPrice(body.price);
  const imageUrl = readOptionalString(body, 'image_url', 255);
  const productCondition = readCondition(body.product_condition);
  const quantity = readNonNegativeInt(body.quantity, 'quantity');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[product]] = await connection.query(
      `SELECT product_id, seller_customer_id
      FROM product
      WHERE product_id = ?
      FOR UPDATE`,
      [productId],
    );

    if (!product) {
      const error = new Error('Product was not found.');
      error.statusCode = 404;
      throw error;
    }

    if (Number(product.seller_customer_id) !== customerId) {
      const error = new Error('Only the seller can update this product.');
      error.statusCode = 403;
      throw error;
    }

    const [[category]] = await connection.query(
      'SELECT category_id FROM category WHERE category_id = ?',
      [categoryId],
    );

    if (!category) {
      const error = new Error('Category was not found.');
      error.statusCode = 404;
      throw error;
    }

    await connection.query(
      `UPDATE product
      SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        image_url = ?,
        product_condition = ?,
        updated_at = NOW()
      WHERE product_id = ?`,
      [categoryId, name, description, price, imageUrl, productCondition, productId],
    );

    await connection.query(
      `UPDATE inventory
      SET
        quantity_in_stock = ?,
        stock_status = CASE
          WHEN ? <= 0 THEN 'out'
          WHEN ? <= reorder_level THEN 'low'
          ELSE 'in_stock'
        END,
        last_updated = NOW()
      WHERE product_id = ?`,
      [quantity, quantity, quantity, productId],
    );

    await connection.commit();

    return res.json({
      product_id: productId,
      customer_id: customerId,
      name,
      price,
      product_condition: productCondition,
      quantity_in_stock: quantity,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listCategories(req, res) {
  const [rows] = await pool.query(
    `SELECT
      c.category_id,
      c.parent_category_id,
      c.name,
      c.description,
      parent.name AS parent_name,
      COUNT(p.product_id) AS product_count
    FROM category c
    LEFT JOIN category parent ON parent.category_id = c.parent_category_id
    LEFT JOIN product p ON p.category_id = c.category_id
    GROUP BY
      c.category_id, c.parent_category_id, c.name, c.description, parent.name
    ORDER BY c.parent_category_id IS NOT NULL, c.name`,
  );

  return res.json(rows);
}

async function listCustomers(req, res) {
  const [rows] = await pool.query(
    `SELECT
      c.customer_id,
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.role,
      a.street,
      a.city,
      a.country,
      a.postal_code,
      c.created_at,
      c.is_active,
      COUNT(o.order_id) AS order_count,
      COALESCE(SUM(o.total_amount), 0) AS total_spent,
      MAX(o.order_date) AS last_order_at
    FROM customer c
    LEFT JOIN orders o ON o.customer_id = c.customer_id
    LEFT JOIN address a ON a.customer_id = c.customer_id AND a.is_default = TRUE
    GROUP BY
      c.customer_id,
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.role,
      a.street,
      a.city,
      a.country,
      a.postal_code,
      c.created_at,
      c.is_active
    ORDER BY c.created_at DESC, c.customer_id DESC`,
  );

  return res.json(rows);
}

async function signIn(req, res) {
  const body = parseBody(req);
  const email = readString(body, 'email', 'Email', 100).toLowerCase();
  const password = readString(body, 'password', 'Password', 255);

  if (email === 'admin@kfupm.edu.sa' && password === 'admin123') {
    return res.json({
      kind: 'admin',
      admin: {
        name: 'KFUPM Store Admin',
        email,
      },
    });
  }

  const [[customer]] = await pool.query(
    `SELECT
      c.customer_id,
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.role,
      a.street,
      a.city,
      a.country,
      a.postal_code,
      c.is_active,
      c.password_hash
    FROM customer c
    LEFT JOIN address a ON a.customer_id = c.customer_id AND a.is_default = TRUE
    WHERE c.email = ?
    LIMIT 1`,
    [email],
  );

  if (!customer || !customer.is_active) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const seededPassword =
    String(customer.password_hash).startsWith('hashed_pass_') && password === 'password';

  if (customer.password_hash !== password && !seededPassword) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  delete customer.password_hash;
  await getOrCreateCart(customer.customer_id);

  return res.json({ kind: 'customer', customer });
}

async function signUp(req, res) {
  const body = parseBody(req);
  const firstName = readString(body, 'first_name', 'First name', 50);
  const lastName = readString(body, 'last_name', 'Last name', 50);
  const email = readString(body, 'email', 'Email', 100).toLowerCase();
  const password = readString(body, 'password', 'Password', 255);
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 20) : null;
  const role = readRole(body.role);
  const street = readString(body, 'street', 'Street', 150);
  const city = readString(body, 'city', 'City', 80);
  const country = readString(body, 'country', 'Country', 60);
  const postalCode =
    typeof body.postal_code === 'string' ? body.postal_code.trim().slice(0, 20) : null;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [customerResult] = await connection.query(
      `INSERT INTO customer
        (first_name, last_name, email, password_hash, phone, role, created_at, updated_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), TRUE)`,
      [firstName, lastName, email, password, phone, role],
    );
    const customerId = customerResult.insertId;

    await connection.query(
      `INSERT INTO address
        (customer_id, street, city, country, postal_code, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, TRUE, NOW())`,
      [customerId, street, city, country, postalCode],
    );

    await getOrCreateCart(customerId, connection);
    await connection.commit();

    return res.status(201).json({
      kind: 'customer',
      customer: {
        customer_id: customerId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        role,
        street,
        city,
        country,
        postal_code: postalCode,
        is_active: true,
      },
    });
  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    throw error;
  } finally {
    connection.release();
  }
}

async function updateCustomer(req, res) {
  const body = parseBody(req);
  const customerId = readPositiveInt(body.customer_id, 'customer_id');
  const firstName = readString(body, 'first_name', 'First name', 50);
  const lastName = readString(body, 'last_name', 'Last name', 50);
  const email = readString(body, 'email', 'Email', 100).toLowerCase();
  const password = readOptionalString(body, 'password', 255);
  const phone = readOptionalString(body, 'phone', 20);
  const role = readRole(body.role);
  const street = readString(body, 'street', 'Street', 150);
  const city = readString(body, 'city', 'City', 80);
  const country = readString(body, 'country', 'Country', 60);
  const postalCode = readOptionalString(body, 'postal_code', 20);
  const connection = await pool.getConnection();

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Email must be valid.' });
  }

  if (password && password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  try {
    await connection.beginTransaction();

    const [[customer]] = await connection.query(
      'SELECT customer_id FROM customer WHERE customer_id = ? AND is_active = TRUE FOR UPDATE',
      [customerId],
    );

    if (!customer) {
      const error = new Error('Customer was not found.');
      error.statusCode = 404;
      throw error;
    }

    if (password) {
      await connection.query(
        `UPDATE customer
        SET first_name = ?, last_name = ?, email = ?, password_hash = ?, phone = ?, role = ?, updated_at = NOW()
        WHERE customer_id = ?`,
        [firstName, lastName, email, password, phone, role, customerId],
      );
    } else {
      await connection.query(
        `UPDATE customer
        SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, updated_at = NOW()
        WHERE customer_id = ?`,
        [firstName, lastName, email, phone, role, customerId],
      );
    }

    const [[address]] = await connection.query(
      `SELECT address_id
      FROM address
      WHERE customer_id = ?
      ORDER BY is_default DESC, address_id ASC
      LIMIT 1`,
      [customerId],
    );

    if (address) {
      await connection.query(
        `UPDATE address
        SET street = ?, city = ?, country = ?, postal_code = ?, is_default = TRUE
        WHERE address_id = ?`,
        [street, city, country, postalCode, address.address_id],
      );
    } else {
      await connection.query(
        `INSERT INTO address
          (customer_id, street, city, country, postal_code, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, TRUE, NOW())`,
        [customerId, street, city, country, postalCode],
      );
    }

    const [[updatedCustomer]] = await connection.query(
      `SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.role,
        a.street,
        a.city,
        a.country,
        a.postal_code,
        c.is_active
      FROM customer c
      LEFT JOIN address a ON a.customer_id = c.customer_id AND a.is_default = TRUE
      WHERE c.customer_id = ?
      LIMIT 1`,
      [customerId],
    );

    await connection.commit();
    return res.json(updatedCustomer);
  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    throw error;
  } finally {
    connection.release();
  }
}

async function getOrCreateCart(customerId, connection = pool) {
  const [[cart]] = await connection.query(
    'SELECT cart_id FROM cart WHERE customer_id = ?',
    [customerId],
  );

  if (cart) {
    return cart.cart_id;
  }

  const [result] = await connection.query(
    'INSERT INTO cart (customer_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
    [customerId],
  );

  return result.insertId;
}

async function getCart(req, res) {
  const customerId = readPositiveInt(req.query?.customer_id || 1, 'customer_id');
  const cartId = await getOrCreateCart(customerId);
  const [items] = await pool.query(
    `SELECT
      ci.cart_id,
      ci.product_id,
      ci.quantity,
      p.name,
      p.description,
      CAST(p.price AS DECIMAL(10,2)) AS price,
      p.image_url,
      c.name AS category_name,
      i.quantity_in_stock,
      i.stock_status,
      (ci.quantity * p.price) AS line_total
    FROM cart_item ci
    JOIN product p ON p.product_id = ci.product_id
    JOIN category c ON c.category_id = p.category_id
    LEFT JOIN inventory i ON i.product_id = p.product_id
    WHERE ci.cart_id = ?
    ORDER BY ci.added_at DESC`,
    [cartId],
  );
  const total = items.reduce((sum, item) => sum + Number(item.line_total), 0);

  return res.json({ cart_id: cartId, customer_id: customerId, items, total });
}

async function addCartItem(req, res) {
  const body = parseBody(req);
  const customerId = readPositiveInt(body.customer_id, 'customer_id');
  const productId = readPositiveInt(body.product_id, 'product_id');
  const quantity = readPositiveInt(body.quantity || 1, 'quantity');

  const [[product]] = await pool.query(
    `SELECT
      p.product_id,
      i.quantity_in_stock
    FROM product p
    LEFT JOIN inventory i ON i.product_id = p.product_id
    WHERE p.product_id = ? AND p.is_active = TRUE`,
    [productId],
  );

  if (!product) {
    return res.status(404).json({ error: 'product was not found.' });
  }

  const cartId = await getOrCreateCart(customerId);
  const [[existing]] = await pool.query(
    'SELECT quantity FROM cart_item WHERE cart_id = ? AND product_id = ?',
    [cartId, productId],
  );
  const nextQuantity = Number(existing?.quantity || 0) + quantity;

  if (product.quantity_in_stock !== null && nextQuantity > product.quantity_in_stock) {
    return res.status(409).json({ error: 'Requested quantity exceeds available stock.' });
  }

  await pool.query(
    `INSERT INTO cart_item (cart_id, product_id, quantity, added_at)
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), added_at = NOW()`,
    [cartId, productId, nextQuantity],
  );
  await pool.query('UPDATE cart SET updated_at = NOW() WHERE cart_id = ?', [cartId]);

  return res.status(201).json({ cart_id: cartId, product_id: productId, quantity: nextQuantity });
}

async function updateCartItem(req, res) {
  const body = parseBody(req);
  const customerId = readPositiveInt(body.customer_id, 'customer_id');
  const productId = readPositiveInt(body.product_id, 'product_id');
  const quantity = readPositiveInt(body.quantity, 'quantity');
  const cartId = await getOrCreateCart(customerId);
  const [[stock]] = await pool.query(
    'SELECT quantity_in_stock FROM inventory WHERE product_id = ?',
    [productId],
  );

  if (stock && quantity > stock.quantity_in_stock) {
    return res.status(409).json({ error: 'Requested quantity exceeds available stock.' });
  }

  const [result] = await pool.query(
    'UPDATE cart_item SET quantity = ?, added_at = NOW() WHERE cart_id = ? AND product_id = ?',
    [quantity, cartId, productId],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'cart item was not found.' });
  }

  await pool.query('UPDATE cart SET updated_at = NOW() WHERE cart_id = ?', [cartId]);

  return res.json({ cart_id: cartId, product_id: productId, quantity });
}

async function deleteCartItem(req, res) {
  const customerId = readPositiveInt(req.query?.customer_id, 'customer_id');
  const productId = readPositiveInt(req.query?.product_id, 'product_id');
  const cartId = await getOrCreateCart(customerId);
  const [result] = await pool.query(
    'DELETE FROM cart_item WHERE cart_id = ? AND product_id = ?',
    [cartId, productId],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'cart item was not found.' });
  }

  await pool.query('UPDATE cart SET updated_at = NOW() WHERE cart_id = ?', [cartId]);

  return res.json({ success: true });
}

async function listOrders(req, res) {
  const customerId = readOptionalPositiveInt(req.query?.customer_id, 'customer_id');
  const sellerCustomerId = readOptionalPositiveInt(
    req.query?.seller_customer_id,
    'seller_customer_id',
  );
  const params = [];
  const filters = [];

  if (customerId) {
    filters.push('o.customer_id = ?');
    params.push(customerId);
  }

  if (sellerCustomerId) {
    filters.push('p.seller_customer_id = ?');
    params.push(sellerCustomerId);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const [orders] = await pool.query(
    `SELECT
      o.order_id,
      o.customer_id,
      CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone,
      o.order_date,
      o.order_status,
      o.payment_status,
      o.payment_method,
      CAST(o.total_amount AS DECIMAL(10,2)) AS total_amount,
      CAST(COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS DECIMAL(10,2)) AS seller_total_amount,
      COUNT(oi.product_id) AS item_count,
      GROUP_CONCAT(CONCAT(p.name, ' x', oi.quantity) ORDER BY p.name SEPARATOR ', ') AS items
    FROM orders o
    JOIN customer c ON c.customer_id = o.customer_id
    LEFT JOIN order_item oi ON oi.order_id = o.order_id
    LEFT JOIN product p ON p.product_id = oi.product_id
    ${whereClause}
    GROUP BY
      o.order_id, o.customer_id, c.first_name, c.last_name, c.email, c.phone, o.order_date,
      o.order_status, o.payment_status, o.payment_method, o.total_amount
    ORDER BY o.order_date DESC, o.order_id DESC
    LIMIT 20`,
    params,
  );

  return res.json(orders);
}

async function createOrder(req, res) {
  const body = parseBody(req);
  const customerId = readPositiveInt(body.customer_id, 'customer_id');
  const paymentMethod = readPaymentMethod(body.payment_method);
  const paymentStatus = body.payment_confirmed ? 'paid' : 'unpaid';
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const cartId = await getOrCreateCart(customerId, connection);
    const [[address]] = await connection.query(
      `SELECT address_id
      FROM address
      WHERE customer_id = ?
      ORDER BY is_default DESC, address_id ASC
      LIMIT 1`,
      [customerId],
    );

    if (!address) {
      const error = new Error('customer needs an address before checkout.');
      error.statusCode = 400;
      throw error;
    }

    const [items] = await connection.query(
      `SELECT
        ci.product_id,
        ci.quantity,
        p.price,
        p.name,
        i.quantity_in_stock
      FROM cart_item ci
      JOIN product p ON p.product_id = ci.product_id
      JOIN inventory i ON i.product_id = p.product_id
      WHERE ci.cart_id = ?
      FOR UPDATE`,
      [cartId],
    );

    if (items.length === 0) {
      const error = new Error('cart is empty.');
      error.statusCode = 400;
      throw error;
    }

    for (const item of items) {
      if (item.quantity > item.quantity_in_stock) {
        const error = new Error(`${item.name} does not have enough stock.`);
        error.statusCode = 409;
        throw error;
      }
    }

    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );
    const [orderResult] = await connection.query(
      `INSERT INTO orders
        (customer_id, address_id, order_date, order_status, payment_status, payment_method, total_amount, created_at, updated_at)
      VALUES (?, ?, NOW(), 'pending', ?, ?, ?, NOW(), NOW())`,
      [customerId, address.address_id, paymentStatus, paymentMethod, total],
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_item (order_id, product_id, quantity, unit_price, created_at)
        VALUES (?, ?, ?, ?, NOW())`,
        [orderId, item.product_id, item.quantity, item.price],
      );
      await connection.query(
        `UPDATE inventory
        SET
          quantity_in_stock = quantity_in_stock - ?,
          stock_status = CASE
            WHEN quantity_in_stock - ? <= 0 THEN 'out'
            WHEN quantity_in_stock - ? <= reorder_level THEN 'low'
            ELSE 'in_stock'
          END,
          last_updated = NOW()
        WHERE product_id = ?`,
        [item.quantity, item.quantity, item.quantity, item.product_id],
      );
    }

    await connection.query('DELETE FROM cart_item WHERE cart_id = ?', [cartId]);
    await connection.query('UPDATE cart SET updated_at = NOW() WHERE cart_id = ?', [cartId]);
    await connection.commit();

    return res.status(201).json({
      order_id: orderId,
      customer_id: customerId,
      total_amount: Number(total.toFixed(2)),
      payment_status: paymentStatus,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function confirmDelivery(req, res) {
  const body = parseBody(req);
  const orderId = readPositiveInt(body.order_id || req.query?.order_id, 'order_id');
  const customerId = readPositiveInt(body.customer_id, 'customer_id');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[order]] = await connection.query(
      `SELECT
        o.order_id,
        o.order_status
      FROM orders o
      JOIN order_item oi ON oi.order_id = o.order_id
      JOIN product p ON p.product_id = oi.product_id
      WHERE o.order_id = ?
        AND p.seller_customer_id = ?
      LIMIT 1
      FOR UPDATE`,
      [orderId, customerId],
    );

    if (!order) {
      const error = new Error('Seller order was not found.');
      error.statusCode = 404;
      throw error;
    }

    if (order.order_status === 'cancelled') {
      const error = new Error('Cancelled orders cannot be marked delivered.');
      error.statusCode = 409;
      throw error;
    }

    await connection.query(
      `UPDATE orders
      SET order_status = 'delivered', updated_at = NOW()
      WHERE order_id = ?`,
      [orderId],
    );

    await connection.commit();
    return res.json({ order_id: orderId, order_status: 'delivered' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function cancelOrder(req, res) {
  const body = parseBody(req);

  if (body.action === 'confirm_delivery') {
    return confirmDelivery(req, res);
  }

  const orderId = readPositiveInt(body.order_id || req.query?.order_id, 'order_id');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[order]] = await connection.query(
      `SELECT order_id, order_status, payment_status
      FROM orders
      WHERE order_id = ?
      FOR UPDATE`,
      [orderId],
    );

    if (!order) {
      const error = new Error('Order was not found.');
      error.statusCode = 404;
      throw error;
    }

    if (order.order_status === 'cancelled') {
      await connection.commit();
      return res.json({ order_id: orderId, order_status: 'cancelled' });
    }

    const [items] = await connection.query(
      'SELECT product_id, quantity FROM order_item WHERE order_id = ?',
      [orderId],
    );

    for (const item of items) {
      await connection.query(
        `UPDATE inventory
        SET
          quantity_in_stock = quantity_in_stock + ?,
          stock_status = CASE
            WHEN quantity_in_stock + ? <= 0 THEN 'out'
            WHEN quantity_in_stock + ? <= reorder_level THEN 'low'
            ELSE 'in_stock'
          END,
          last_updated = NOW()
        WHERE product_id = ?`,
        [item.quantity, item.quantity, item.quantity, item.product_id],
      );
    }

    await connection.query(
      `UPDATE orders
      SET
        order_status = 'cancelled',
        payment_status = CASE WHEN payment_status = 'paid' THEN 'refunded' ELSE payment_status END,
        updated_at = NOW()
      WHERE order_id = ?`,
      [orderId],
    );

    await connection.commit();
    return res.json({ order_id: orderId, order_status: 'cancelled' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listReviews(req, res) {
  const [rows] = await pool.query(
    `SELECT
      r.review_id,
      r.rating,
      r.comment,
      r.created_at,
      p.name AS product_name,
      CONCAT(c.first_name, ' ', c.last_name) AS customer_name
    FROM review r
    JOIN product p ON p.product_id = r.product_id
    JOIN customer c ON c.customer_id = r.customer_id
    ORDER BY r.created_at DESC, r.review_id DESC
    LIMIT 10`,
  );

  return res.json(rows);
}

async function getSummary(req, res) {
  const [[productStats]] = await pool.query(
    `SELECT
      COUNT(*) AS total_products,
      SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active_products
    FROM product`,
  );
  const [[orderStats]] = await pool.query(
    `SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total_amount), 0) AS revenue
    FROM orders`,
  );
  const [[inventoryStats]] = await pool.query(
    `SELECT
      SUM(CASE WHEN stock_status = 'low' THEN 1 ELSE 0 END) AS low_stock,
      SUM(CASE WHEN stock_status = 'out' THEN 1 ELSE 0 END) AS out_of_stock
    FROM inventory`,
  );
  const [[customerStats]] = await pool.query(
    'SELECT COUNT(*) AS total_customers FROM customer WHERE is_active = TRUE',
  );

  return res.json({
    total_products: Number(productStats.total_products || 0),
    active_products: Number(productStats.active_products || 0),
    total_orders: Number(orderStats.total_orders || 0),
    revenue: Number(orderStats.revenue || 0),
    low_stock: Number(inventoryStats.low_stock || 0),
    out_of_stock: Number(inventoryStats.out_of_stock || 0),
    total_customers: Number(customerStats.total_customers || 0),
  });
}

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  let message = statusCode === 500 ? 'Database request failed.' : error.message;

  if (error.code === 'ENOTFOUND') {
    message = 'Database host could not be reached. Check DB_HOST in .env.';
  }

  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    message = 'Database login failed. Check DB_USER and DB_PASSWORD in .env.';
  }

  if (error.code === 'ER_BAD_DB_ERROR') {
    message = 'Database was not found. Check DB_NAME in .env.';
  }

  if (error.code === 'ER_NO_SUCH_TABLE') {
    message = 'A required table is missing. Refresh and let the API initialize the schema.';
  }

  return res.status(statusCode).json({ error: message });
}

export async function handleStoreRoute(req, res, routeName) {
  try {
    await setupStore();

    if (routeName === 'summary' && req.method === 'GET') {
      return await getSummary(req, res);
    }

    if (routeName === 'auth' && req.method === 'POST') {
      return await signIn(req, res);
    }

    if (routeName === 'signup' && req.method === 'POST') {
      return await signUp(req, res);
    }

    if (routeName === 'products' && req.method === 'GET') {
      return await listProducts(req, res);
    }

    if (routeName === 'products' && req.method === 'POST') {
      return await createProduct(req, res);
    }

    if (routeName === 'products' && req.method === 'PATCH') {
      return await updateProduct(req, res);
    }

    if (routeName === 'categories' && req.method === 'GET') {
      return await listCategories(req, res);
    }

    if (routeName === 'customers' && req.method === 'GET') {
      return await listCustomers(req, res);
    }

    if (routeName === 'customers' && req.method === 'PATCH') {
      return await updateCustomer(req, res);
    }

    if (routeName === 'cart' && req.method === 'GET') {
      return await getCart(req, res);
    }

    if (routeName === 'cart' && req.method === 'POST') {
      return await addCartItem(req, res);
    }

    if (routeName === 'cart' && req.method === 'PATCH') {
      return await updateCartItem(req, res);
    }

    if (routeName === 'cart' && req.method === 'DELETE') {
      return await deleteCartItem(req, res);
    }

    if (routeName === 'orders' && req.method === 'GET') {
      return await listOrders(req, res);
    }

    if (routeName === 'orders' && req.method === 'POST') {
      return await createOrder(req, res);
    }

    if (routeName === 'orders' && req.method === 'PATCH') {
      return await cancelOrder(req, res);
    }

    if (routeName === 'reviews' && req.method === 'GET') {
      return await listReviews(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed for this route.' });
  } catch (error) {
    return sendError(res, error);
  }
}

export default async function handler(req, res) {
  const routeName =
    typeof req.query?.route === 'string' ? req.query.route : 'summary';

  return handleStoreRoute(req, res, routeName);
}
