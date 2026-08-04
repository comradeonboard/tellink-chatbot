const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('FATAL: GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const CREDITS_PER_CALL = parseFloat(process.env.CREDITS_PER_CALL) || 0.50;

const dbPath = path.join(__dirname, 'database', 'tellink.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database:', dbPath);
});

db.run(`CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  policies TEXT NOT NULL,
  services TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  support_phone TEXT,
  support_email TEXT,
  website TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_id INTEGER NOT NULL,
  phone TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS api_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  model TEXT,
  cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  balance REAL DEFAULT 200.00,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.get('SELECT balance FROM credits LIMIT 1', (err, row) => {
  if (!row) {
    db.run('INSERT INTO credits (balance) VALUES (?)', [200.00]);
  }
});

const SYSTEM_PROMPT_TEMPLATE = (company) => `You are a customer support chatbot for ${company.name}. Be helpful, professional, and concise.

Company Information:
- Name: ${company.name}
- Contact: ${company.support_phone} | ${company.support_email}
- Website: ${company.website}
- Address: ${company.contact_info}

Company Policies:
${company.policies}

Company Services:
${company.services}

Guidelines:
1. Always be polite, professional, and empathetic.
2. Provide accurate information based on the company data above.
3. If the question is outside the company's scope, say so and suggest contacting support.
4. Do not make up policies or services not listed above.
5. Keep responses concise and actionable.
6. If a customer reports an outage or service issue, acknowledge it and direct them to the support phone or email.`;

async function deductCredits(customerId, model, cost) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE credits SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [cost], function(err) {
      if (err) return reject(err);
      db.run('INSERT INTO api_usage (customer_id, model, cost) VALUES (?, ?, ?)', [customerId, model, cost], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

async function getCreditBalance() {
  return new Promise((resolve, reject) => {
    db.get('SELECT balance FROM credits LIMIT 1', (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.balance : 200.00);
    });
  });
}

app.post('/api/chat', async (req, res) => {
  const { customerId, question } = req.body;

  if (!customerId || !question) {
    return res.status(400).json({ error: 'customerId and question are required' });
  }

  if (!question.trim()) {
    return res.status(400).json({ error: 'question cannot be empty' });
  }

  try {
    const customer = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM customers WHERE id = ?', [customerId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const company = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM companies WHERE id = ?', [customer.company_id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!company) {
      return res.status(500).json({ error: 'Company not found for this customer' });
    }

    const model = genAI.getGenerativeModel({ model: MODEL });
    const chat = model.startChat({ history: [] });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullReply = '';
    const result = await chat.sendMessageStream(question.trim());
    for await (const chunk of result.stream) {
      const delta = chunk.text();
      if (delta) {
        fullReply += delta;
        res.write('data: ' + JSON.stringify({ content: delta }) + '\n\n');
      }
    }

    await deductCredits(customerId, MODEL, CREDITS_PER_CALL);

    res.write('data: [DONE]\n\n');
    res.end();

    console.log(`Chat: customer=${customerId} model=${MODEL} cost=$${CREDITS_PER_CALL.toFixed(2)}`);
  } catch (error) {
    console.error('Chat error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat request' });
    }
  }
});

app.get('/api/credits', async (req, res) => {
  try {
    const balance = await getCreditBalance();
    res.json({ balance: balance.toFixed(2), currency: 'USD' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

app.get('/api/customers', (req, res) => {
  db.all('SELECT id, name, email, phone FROM customers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: MODEL, creditsPerCall: CREDITS_PER_CALL });
});

app.use(express.static(path.join(__dirname, 'src', 'web', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'web', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TelLink Chatbot server running on port ${PORT}`);
  console.log(`Gemini model: ${MODEL}`);
  console.log(`Credits per call: $${CREDITS_PER_CALL.toFixed(2)}`);
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});