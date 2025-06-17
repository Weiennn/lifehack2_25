const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./quiz.db');

// On startup, create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      title TEXT DEFAULT 'Untitled Quiz'
    );
  `, (err) => {
    if (err) console.error('Error creating table:', err);
  });
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
  `, (err) => {
    if (err) console.error('Error creating table:', err);
  });
  db.run(`
    CREATE TABLE IF NOT EXISTS user_quiz_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      quiz_id INTEGER NOT NULL,
      confidence_score INTEGER DEFAULT 0,
      asked_question_ids TEXT DEFAULT '[]', -- JSON string of array of question IDs
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id),
      UNIQUE(username, quiz_id)
    );
  `, (err) => {
    if (err) console.error('Error creating table:', err);
  });
});

module.exports = db;
