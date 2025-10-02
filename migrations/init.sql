BEGIN;

CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE branch_products (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  stock INTEGER DEFAULT 0,
  rental_price NUMERIC(12,2) DEFAULT 0,
  replacement_cost NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(branch_id, product_id)
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN','ADMIN_STORE','KASIR_STORE')),
  branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE rentals (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE,
  branch_id INTEGER REFERENCES branches(id),
  customer_id INTEGER REFERENCES customers(id),
  user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'ongoing',
  start_date DATE,
  due_date DATE,
  return_date DATE,
  total_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE rental_items (
  id SERIAL PRIMARY KEY,
  rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
  branch_product_id INTEGER REFERENCES branch_products(id),
  qty INTEGER NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  rental_id INTEGER REFERENCES rentals(id),
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash','transfer','qris')) DEFAULT 'cash',
  status TEXT CHECK (status IN ('paid','pending','refunded')) DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE inventory_movements (
  id SERIAL PRIMARY KEY,
  branch_product_id INTEGER REFERENCES branch_products(id),
  movement_type TEXT CHECK (movement_type IN ('in','out','return','damage','lost')),
  qty INTEGER NOT NULL,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE stock_opnames (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES branches(id),
  user_id INTEGER REFERENCES users(id),
  date DATE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE stock_opname_items (
  id SERIAL PRIMARY KEY,
  stock_opname_id INTEGER REFERENCES stock_opnames(id) ON DELETE CASCADE,
  branch_product_id INTEGER REFERENCES branch_products(id),
  system_stock INTEGER,
  physical_stock INTEGER,
  difference INTEGER
);

COMMIT;
