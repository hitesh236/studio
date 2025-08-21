-- This schema is designed for a comprehensive accounting and inventory management system.
-- It covers user management, company profile, chart of accounts, parties (customers/vendors),
-- product and stock management, sales, purchases, and GST compliance.

-- =============================================================================
-- 1. CORE & USER MANAGEMENT
-- =============================================================================

CREATE TABLE company_profile (
    id SERIAL PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    business_type VARCHAR(100),
    gstin VARCHAR(15) UNIQUE,
    pan VARCHAR(10) UNIQUE,
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    contact_email VARCHAR(255),
    phone_number VARCHAR(20),
    website VARCHAR(255),
    logo_url TEXT,
    financial_year_start DATE NOT NULL,
    base_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'create_invoice', 'view_reports'
    category VARCHAR(50) NOT NULL, -- e.g., 'Sales', 'Reporting'
    description TEXT
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- =============================================================================
-- 2. CHART OF ACCOUNTS & LEDGERS
-- =============================================================================

CREATE TABLE account_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES account_groups(id),
    is_primary BOOLEAN DEFAULT FALSE, -- e.g., Assets, Liabilities, Income, Expenses
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ledgers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    group_id INT REFERENCES account_groups(id),
    opening_balance NUMERIC(15, 2) DEFAULT 0.00,
    opening_balance_type VARCHAR(2) CHECK (opening_balance_type IN ('Dr', 'Cr')), -- Debit or Credit
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journal_vouchers (
    id SERIAL PRIMARY KEY,
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    voucher_date DATE NOT NULL,
    narration TEXT,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journal_voucher_entries (
    id SERIAL PRIMARY KEY,
    voucher_id INT REFERENCES journal_vouchers(id) ON DELETE CASCADE,
    ledger_id INT REFERENCES ledgers(id),
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(2) CHECK (type IN ('Dr', 'Cr'))
);

-- =============================================================================
-- 3. PARTIES (CUSTOMERS & VENDORS)
-- =============================================================================

CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    party_type VARCHAR(10) NOT NULL CHECK (party_type IN ('customer', 'vendor', 'both')),
    gstin VARCHAR(15),
    pan VARCHAR(10),
    primary_email VARCHAR(255),
    primary_phone VARCHAR(20),
    billing_address TEXT,
    shipping_address TEXT,
    ledger_id INT REFERENCES ledgers(id), -- Connects to the accounting system
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. PRODUCTS & INVENTORY
-- =============================================================================

CREATE TABLE simple_units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    abbreviation VARCHAR(10) UNIQUE NOT NULL
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
    parent_id INT REFERENCES product_categories(id)
);

CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'dropdown', 'checkbox', 'date')),
    is_global BOOLEAN DEFAULT FALSE
);

CREATE TABLE product_attribute_options (
    id SERIAL PRIMARY KEY,
    attribute_id INT REFERENCES product_attributes(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL
);

CREATE TABLE category_attributes (
    category_id INT REFERENCES product_categories(id),
    attribute_id INT REFERENCES product_attributes(id),
    PRIMARY KEY (category_id, attribute_id)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category_id INT REFERENCES product_categories(id),
    hsn_code VARCHAR(8),
    gst_rate NUMERIC(5, 2) DEFAULT 18.00,
    primary_uom_id INT REFERENCES simple_units(id),
    purchase_price NUMERIC(15, 2),
    selling_price NUMERIC(15, 2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_attribute_values (
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    attribute_id INT REFERENCES product_attributes(id) ON DELETE CASCADE,
    value TEXT,
    PRIMARY KEY (product_id, attribute_id)
);

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    location VARCHAR(100) NOT NULL DEFAULT 'Main Warehouse',
    quantity_on_hand NUMERIC(15, 4) NOT NULL DEFAULT 0,
    batch_number VARCHAR(100),
    expiry_date DATE,
    last_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_adjustments (
    id SERIAL PRIMARY KEY,
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,
    adjustment_date DATE NOT NULL,
    reason TEXT,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_adjustment_items (
    id SERIAL PRIMARY KEY,
    adjustment_id INT REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(15, 4) NOT NULL, -- Positive for addition, negative for reduction
    notes TEXT
);

CREATE TABLE stock_transfers (
    id SERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    transfer_date DATE NOT NULL,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Transit', 'Completed')),
    initiated_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_transfer_items (
    id SERIAL PRIMARY KEY,
    transfer_id INT REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(15, 4) NOT NULL
);

-- =============================================================================
-- 5. SALES & RECEIVABLES
-- =============================================================================

CREATE TABLE sales_invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    party_id INT REFERENCES parties(id),
    subtotal NUMERIC(15, 2) NOT NULL,
    total_discount NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) NOT NULL,
    grand_total NUMERIC(15, 2) NOT NULL,
    amount_paid NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Draft', 'Outstanding', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES sales_invoices(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(15, 4) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    taxable_value NUMERIC(15, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL
);

CREATE TABLE credit_notes (
    id SERIAL PRIMARY KEY,
    credit_note_number VARCHAR(50) UNIQUE NOT NULL,
    credit_note_date DATE NOT NULL,
    original_invoice_id INT REFERENCES sales_invoices(id),
    party_id INT REFERENCES parties(id),
    subtotal NUMERIC(15, 2) NOT NULL,
    total_tax NUMERIC(15, 2) NOT NULL,
    grand_total NUMERIC(15, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_note_items (
    id SERIAL PRIMARY KEY,
    credit_note_id INT REFERENCES credit_notes(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(15, 4) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL
);

CREATE TABLE recurring_invoices (
    id SERIAL PRIMARY KEY,
    party_id INT REFERENCES parties(id),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_invoice_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Finished')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recurring_invoice_items (
    id SERIAL PRIMARY KEY,
    recurring_invoice_id INT REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity NUMERIC(15, 4) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL
);

-- =============================================================================
-- 6. PURCHASES & PAYABLES
-- =============================================================================

CREATE TABLE purchase_bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(100) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    party_id INT REFERENCES parties(id),
    subtotal NUMERIC(15, 2) NOT NULL,
    total_discount NUMERIC(15, 2) DEFAULT 0.00,
    total_tax NUMERIC(15, 2) NOT NULL,
    grand_total NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Unpaid', 'Paid', 'Partially Paid')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INT REFERENCES purchase_bills(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(15, 4) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    taxable_value NUMERIC(15, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL
);

CREATE TABLE debit_notes (
    id SERIAL PRIMARY KEY,
    debit_note_number VARCHAR(50) UNIQUE NOT NULL,
    debit_note_date DATE NOT NULL,
    original_bill_id INT REFERENCES purchase_bills(id),
    party_id INT REFERENCES parties(id),
    subtotal NUMERIC(15, 2) NOT NULL,
    total_tax NUMERIC(15, 2) NOT NULL,
    grand_total NUMERIC(15, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE debit_note_items (
    id SERIAL PRIMARY KEY,
    debit_note_id INT REFERENCES debit_notes(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity NUMERIC(15, 4) NOT NULL,
    rate NUMERIC(15, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL
);
