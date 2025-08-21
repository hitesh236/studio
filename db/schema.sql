-- This schema is for a comprehensive accounting and inventory management application.

-- ========= Company & User Management =========

CREATE TABLE company_profile (
    id SERIAL PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    business_type VARCHAR(100),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    contact_email VARCHAR(255),
    phone_number VARCHAR(20),
    website VARCHAR(255),
    gstin VARCHAR(15) UNIQUE,
    pan VARCHAR(10) UNIQUE,
    logo_url TEXT,
    financial_year_start DATE NOT NULL,
    base_currency CHAR(3) NOT NULL DEFAULT 'INR',
    decimal_places INT NOT NULL DEFAULT 2,
    thousand_separator CHAR(1) DEFAULT ',',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- ========= Parties (Customers & Vendors) =========

CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    party_type VARCHAR(20) NOT NULL, -- 'Customer', 'Vendor', 'Both'
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    gstin VARCHAR(15),
    billing_address TEXT,
    shipping_address TEXT,
    opening_balance NUMERIC(15, 2) DEFAULT 0.00,
    balance_type VARCHAR(10) DEFAULT 'debit', -- 'debit' or 'credit'
    credit_limit NUMERIC(15, 2),
    credit_limit_days INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========= Products & Inventory =========

CREATE TABLE simple_units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    abbreviation VARCHAR(10) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE compound_units (
    id SERIAL PRIMARY KEY,
    first_unit_id INT REFERENCES simple_units(id),
    second_unit_id INT REFERENCES simple_units(id),
    conversion_factor NUMERIC(10, 4) NOT NULL
);

CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES product_categories(id),
    description TEXT
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    hsn_code VARCHAR(20),
    category_id INT REFERENCES product_categories(id),
    primary_uom_id INT REFERENCES simple_units(id),
    secondary_uom_id INT REFERENCES simple_units(id),
    purchase_price NUMERIC(15, 2) DEFAULT 0.00,
    selling_price NUMERIC(15, 2) DEFAULT 0.00,
    is_listed_on_website BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'text', 'dropdown', 'checkbox', 'date'
    options TEXT[], -- For dropdown type
    is_global BOOLEAN DEFAULT FALSE
);

CREATE TABLE product_attribute_values (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    attribute_id INT REFERENCES product_attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL
);

CREATE TABLE stock_inventory (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    location VARCHAR(100) NOT NULL,
    quantity_on_hand NUMERIC(15, 4) NOT NULL DEFAULT 0,
    batch_number VARCHAR(100),
    expiry_date DATE,
    min_stock_level NUMERIC(15, 4),
    reorder_qty NUMERIC(15, 4),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ========= Sales & Purchase Transactions =========

CREATE TABLE sales_invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    party_id INT REFERENCES parties(id),
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(15, 2) DEFAULT 0.00,
    gst_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL,
    amount_paid NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL, -- 'Draft', 'Sent', 'Partially Paid', 'Paid', 'Cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sales_invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES sales_invoices(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    description TEXT,
    quantity NUMERIC(15, 4) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00, -- As a percentage or fixed amount
    gst_rate NUMERIC(5, 2)
);

CREATE TABLE credit_notes (
    id SERIAL PRIMARY KEY,
    credit_note_number VARCHAR(50) UNIQUE NOT NULL,
    original_invoice_id INT REFERENCES sales_invoices(id),
    party_id INT REFERENCES parties(id),
    credit_note_date DATE NOT NULL,
    reason TEXT,
    total_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_note_items (
    id SERIAL PRIMARY KEY,
    credit_note_id INT REFERENCES credit_notes(id) ON DELETE CASCADE,
    sales_invoice_item_id INT REFERENCES sales_invoice_items(id),
    quantity NUMERIC(15, 4) NOT NULL
);

CREATE TABLE purchase_bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(100) NOT NULL,
    party_id INT REFERENCES parties(id),
    bill_date DATE NOT NULL,
    due_date DATE,
    total_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INT REFERENCES purchase_bills(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(15, 4) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00
);

CREATE TABLE debit_notes (
    id SERIAL PRIMARY KEY,
    debit_note_number VARCHAR(50) UNIQUE NOT NULL,
    original_bill_id INT REFERENCES purchase_bills(id),
    party_id INT REFERENCES parties(id),
    debit_note_date DATE NOT NULL,
    reason TEXT,
    total_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE debit_note_items (
    id SERIAL PRIMARY KEY,
    debit_note_id INT REFERENCES debit_notes(id) ON DELETE CASCADE,
    purchase_bill_item_id INT REFERENCES purchase_bill_items(id),
    quantity NUMERIC(15, 4) NOT NULL
);

CREATE TABLE recurring_invoices (
    id SERIAL PRIMARY KEY,
    party_id INT REFERENCES parties(id),
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE,
    next_invoice_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Paused', 'Finished'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recurring_invoice_items (
    id SERIAL PRIMARY KEY,
    recurring_invoice_id INT REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    description TEXT,
    quantity NUMERIC(15, 4) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL
);

-- ========= Stock Movements =========

CREATE TABLE stock_adjustments (
    id SERIAL PRIMARY KEY,
    adjustment_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_adjustment_items (
    id SERIAL PRIMARY KEY,
    adjustment_id INT REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    adjustment_type VARCHAR(20) NOT NULL, -- 'addition' or 'reduction'
    quantity NUMERIC(15, 4) NOT NULL
);

CREATE TABLE stock_transfers (
    id SERIAL PRIMARY KEY,
    transfer_date DATE NOT NULL,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Pending', 'In Transit', 'Completed', 'Cancelled'
    notes TEXT,
    initiated_by INT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_transfer_items (
    id SERIAL PRIMARY KEY,
    transfer_id INT REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(15, 4) NOT NULL
);

-- ========= Accounting & Ledgers =========

CREATE TABLE ledgers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    parent_id INT REFERENCES ledgers(id), -- For hierarchical groups
    is_group BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_vouchers (
    id SERIAL PRIMARY KEY,
    voucher_date DATE NOT NULL,
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    narration TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_voucher_items (
    id SERIAL PRIMARY KEY,
    voucher_id INT REFERENCES journal_vouchers(id) ON DELETE CASCADE,
    ledger_id INT REFERENCES ledgers(id),
    debit_amount NUMERIC(15, 2) DEFAULT 0.00,
    credit_amount NUMERIC(15, 2) DEFAULT 0.00
);
