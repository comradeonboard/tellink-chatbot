CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  policies TEXT NOT NULL,
  services TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  support_phone TEXT,
  support_email TEXT,
  website TEXT
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_id INTEGER NOT NULL,
  phone TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS api_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  model TEXT,
  cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  balance REAL DEFAULT 200.00,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO companies (id, name, policies, services, contact_info, support_phone, support_email, website)
VALUES (1, 'TelLink Communications',
  '1. All plans are billed monthly in advance. 2. Late payments incur a 1.5% monthly fee. 3. Service outages are covered by our 99.9% uptime guarantee. 4. Customer data is protected under our privacy policy. 5. Contract termination requires 30 days notice.',
  '1. Home Internet - Fiber and DSL plans up to 1Gbps. 2. Mobile Plans - Prepaid and postpaid with unlimited options. 3. TV Streaming - 200+ channels including sports and premium. 4. Home Phone - Digital VoIP with unlimited nationwide calling. 5. Business Solutions - Dedicated lines, VPN, and cloud hosting.',
  'TelLink Communications, 123 Telecom Plaza, Suite 400, San Francisco, CA 94105',
  '1-800-TEL-LINK',
  'support@tellink.com',
  'https://www.tellink.com');

INSERT INTO customers (id, name, email, company_id, phone)
VALUES
  (1, 'Alice Johnson', 'alice.johnson@email.com', 1, '555-0101'),
  (2, 'Bob Smith', 'bob.smith@email.com', 1, '555-0102'),
  (3, 'Carol Williams', 'carol.williams@email.com', 1, '555-0103'),
  (4, 'David Brown', 'david.brown@email.com', 1, '555-0104'),
  (5, 'Eve Davis', 'eve.davis@email.com', 1, '555-0105');

INSERT INTO credits (id, balance) VALUES (1, 200.00);