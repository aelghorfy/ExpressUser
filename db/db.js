const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Could not connect to database', err);
    else console.log('Connected to database');
});

// Create Users Table
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'ROLE_USER'
    )
`);

// Create Posts Table
db.run(`
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        price FLOAT,
        imagePath TEXT,
        status TEXT DEFAULT 'PENDING',
        userId INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id)
    )
`);



module.exports = db;

