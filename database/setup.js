const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'tellink.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  db.exec(sql, (err) => {
    if (err) {
      console.error('Error initializing database:', err.message);
      process.exit(1);
    }
    console.log('Database initialized successfully at', dbPath);

    db.get('SELECT balance FROM credits LIMIT 1', (err, row) => {
      if (err) {
        console.error('Error checking credits:', err.message);
      } else {
        console.log('Initial credit balance: $' + row.balance.toFixed(2));
      }
      db.close();
    });
  });
});