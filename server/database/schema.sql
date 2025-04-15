-- Employees Table
CREATE TABLE Employees (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Consider hashing passwords
    hourly_rate DECIMAL(10, 2)
);

-- Managers Table
CREATE TABLE Managers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL -- Consider hashing passwords
);

-- Timesheets Table
CREATE TABLE Timesheets (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')), -- Example statuses
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    manager_id INTEGER,
    FOREIGN KEY (manager_id) REFERENCES Managers(id) ON DELETE SET NULL -- Or ON DELETE CASCADE depending on requirements
);

-- Workdays Table
CREATE TABLE Workdays (
    id SERIAL PRIMARY KEY,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    date DATE NOT NULL,
    daily_pay DECIMAL(10, 2),
    employee_id INTEGER NOT NULL,
    timesheet_id INTEGER,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    FOREIGN KEY (timesheet_id) REFERENCES Timesheets(id) ON DELETE SET NULL -- Or ON DELETE CASCADE
);

-- Inventory Table
CREATE TABLE Inventory (
    id SERIAL PRIMARY KEY,
    price_per_pound DECIMAL(10, 2),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(10, 2), -- Assuming quantity can be fractional (e.g., pounds)
    price_per_box DECIMAL(10, 2),
    manager_id INTEGER,
    FOREIGN KEY (manager_id) REFERENCES Managers(id) ON DELETE SET NULL -- Or ON DELETE CASCADE
);

-- Customers Table (Updated)
CREATE TABLE Customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE, -- Allows NULL, but non-NULL values must be unique
    phone VARCHAR(20) NOT NULL, -- Phone is now required at DB level
    password VARCHAR(255) -- Allows NULL for password initially
);

-- Invoices Table
CREATE TABLE Invoices (
    id SERIAL PRIMARY KEY,
    total DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    checked_out BOOLEAN DEFAULT FALSE,
    paid BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    customer_id INTEGER NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- Invoice_Items Table
CREATE TABLE Invoice_Items (
    id SERIAL PRIMARY KEY,
    quantity DECIMAL(10, 2), -- Assuming quantity can be fractional
    notes TEXT,
    amount DECIMAL(12, 2) NOT NULL, -- Total price for this line item (quantity * price)
    price DECIMAL(10, 2) NOT NULL, -- Price per unit/pound/box at the time of invoice creation
    weight DECIMAL(10, 2), -- Optional weight if applicable
    item VARCHAR(255) NOT NULL, -- Consider if this should link to Inventory or just be a description
    invoice_id INTEGER NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES Invoices(id) ON DELETE CASCADE
);

-- Indexes for frequently queried columns (Example)
CREATE INDEX idx_employee_email ON Employees(email);
CREATE INDEX idx_workdays_employee_date ON Workdays(employee_id, date);
CREATE INDEX idx_timesheet_manager_status ON Timesheets(manager_id, status);
CREATE INDEX idx_invoice_customer_date ON Invoices(customer_id, date);
CREATE INDEX idx_invoice_items_invoice ON Invoice_Items(invoice_id); 