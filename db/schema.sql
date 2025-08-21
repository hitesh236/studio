-- PostgreSQL Schema for Hicks Inc. Accounting and Stock Software

-- ----------------------------
-- Users and Roles
-- ----------------------------

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);


-- ----------------------------
-- Parties (Customers & Vendors)
-- ----------------------------

CREATE TYPE party_type AS ENUM ('Customer', 'Vendor', 'Both');
CREATE TYPE party_status AS ENUM ('Active', 'Inactive');

CREATE TABLE parties (
    party_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    type party_type NOT NULL,
    status party_status DEFAULT 'Active',
    gstin VARCHAR(15),
    pan VARCHAR(10),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    credit_limit NUMERIC(15, 2),
    credit_limit_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(party_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'Billing', 'Shipping'
    street TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India'
);

-- ----------------------------
-- Products, Inventory, and UOM
-- ----------------------------

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES categories(category_id)
);

CREATE TABLE uom (
    uom_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    abbreviation VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(category_id),
    uom_id INTEGER REFERENCES uom(uom_id),
    hsn_code VARCHAR(20),
    gst_rate NUMERIC(5, 2) DEFAULT 18.00,
    purchase_price NUMERIC(15, 2) DEFAULT 0.00,
    selling_price NUMERIC(15, 2) DEFAULT 0.00,
    is_listed_on_website BOOLEAN DEFAULT FALSE,
    short_description TEXT,
    long_description_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_levels (
    stock_level_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    location VARCHAR(100) NOT NULL,
    quantity NUMERIC(15, 3) DEFAULT 0.00,
    min_stock_level NUMERIC(15, 3),
    reorder_qty NUMERIC(15, 3)
);

CREATE TABLE stock_history (
    history_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT NOW(),
    type VARCHAR(50) NOT NULL, -- 'Purchase', 'Sale', 'Adjustment', etc.
    quantity_change NUMERIC(15, 3) NOT NULL,
    reference_id VARCHAR(100), -- e.g., Invoice number, Bill number
    location VARCHAR(100),
    notes TEXT
);

-- ----------------------------
-- Accounting & Transactions
-- ----------------------------

CREATE TABLE ledgers (
    ledger_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    parent_group_id INTEGER REFERENCES ledgers(ledger_id),
    type VARCHAR(50) NOT NULL, -- 'group' or 'ledger'
    is_default BOOLEAN DEFAULT FALSE -- To protect core ledgers from deletion
);

CREATE TABLE journal_entries (
    entry_id SERIAL PRIMARY KEY,
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    voucher_type VARCHAR(50),
    description TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_entry_lines (
    line_id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES journal_entries(entry_id) ON DELETE CASCADE,
    ledger_id INTEGER REFERENCES ledgers(ledger_id),
    debit NUMERIC(15, 2),
    credit NUMERIC(15, 2),
    CONSTRAINT debit_or_credit CHECK ((debit IS NOT NULL AND credit IS NULL) OR (debit IS NULL AND credit IS NOT NULL))
);

-- ----------------------------
-- Sales & Purchases
-- ----------------------------

CREATE TYPE invoice_status AS ENUM ('Draft', 'Outstanding', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled');

CREATE TABLE sales_invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    party_id INTEGER REFERENCES parties(party_id),
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal NUMERIC(15, 2) NOT NULL,
    total_gst NUMERIC(15, 2) NOT NULL,
    grand_total NUMERIC(15, 2) NOT NULL,
    amount_paid NUMERIC(15, 2) DEFAULT 0.00,
    status invoice_status DEFAULT 'Outstanding',
    notes TEXT,
    created_by INTEGER REFERENCES users(user_id)
);

CREATE TABLE sales_invoice_items (
    item_id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES sales_invoices(invoice_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id),
    description TEXT,
    quantity NUMERIC(15, 3) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    gst_rate NUMERIC(5, 2)
);

CREATE TABLE purchase_bills (
    bill_id SERIAL PRIMARY KEY,
    bill_number VARCHAR(100) NOT NULL,
    party_id INTEGER REFERENCES parties(party_id),
    bill_date DATE NOT NULL,
    due_date DATE,
    subtotal NUMERIC(15, 2) NOT NULL,
    total_gst NUMERIC(15, 2) NOT NULL,
    grand_total NUMERIC(15, 2) NOT NULL,
    amount_paid NUMERIC(15, 2) DEFAULT 0.00,
    status invoice_status DEFAULT 'Outstanding',
    notes TEXT
);

CREATE TABLE purchase_bill_items (
    item_id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES purchase_bills(bill_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id),
    description TEXT,
    quantity NUMERIC(15, 3) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    gst_rate NUMERIC(5, 2)
);

-- ----------------------------
-- Returns (Credit/Debit Notes)
-- ----------------------------

CREATE TABLE credit_notes (
    credit_note_id SERIAL PRIMARY KEY,
    original_invoice_id INTEGER REFERENCES sales_invoices(invoice_id),
    credit_note_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    reason TEXT,
    total_amount NUMERIC(15, 2) NOT NULL
);

CREATE TABLE debit_notes (
    debit_note_id SERIAL PRIMARY KEY,
    original_bill_id INTEGER REFERENCES purchase_bills(bill_id),
    debit_note_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    reason TEXT,
    total_amount NUMERIC(15, 2) NOT NULL
);

-- Note: You would also need tables for credit/debit note items, similar to invoice items.

-- ----------------------------
-- Initial Data (Examples)
-- ----------------------------

INSERT INTO roles (role_name) VALUES ('Admin'), ('Accountant'), ('Auditor'), ('Guest');

-- Further INSERT statements would be needed to populate default ledgers, UOM, etc.
