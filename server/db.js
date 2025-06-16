const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./quiz.db');

// On startup, create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER,
      question TEXT,
      options TEXT,         -- we'll store JSON-stringified array
      correct_index INTEGER,
      difficulty TEXT,
      explanation TEXT,
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
    );
  `);
});

module.exports = db;
