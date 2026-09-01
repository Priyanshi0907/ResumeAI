const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { SQLITE_PATH } = require('./env');

// Ensure database directory exists
const dbDir = path.dirname(SQLITE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(SQLITE_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${SQLITE_PATH}`);
  }
});

// Initialize database tables
const initDb = () => {
  db.serialize(() => {
    // 1. App Users
    db.run(`
      CREATE TABLE IF NOT EXISTS app_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        timestamp TEXT
      )
    `);

    // 2. User Data (analyzed resumes)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sec_token TEXT,
        ip_add TEXT,
        host_name TEXT,
        dev_user TEXT,
        os_name_ver TEXT,
        latlong TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        act_name TEXT,
        act_mail TEXT,
        act_mob TEXT,
        name TEXT,
        email TEXT,
        resume_score TEXT,
        timestamp TEXT,
        no_of_pages TEXT,
        predicted_field TEXT,
        user_level TEXT,
        actual_skills TEXT,
        recommended_skills TEXT,
        recommended_courses TEXT,
        pdf_name TEXT,
        linkedin TEXT,
        github TEXT
      )
    `);

    // 3. User Feedback
    db.run(`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feed_name TEXT,
        feed_email TEXT,
        feed_score TEXT,
        comments TEXT,
        timestamp TEXT
      )
    `);
  });
};

initDb();

// Helper methods returning Promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  db,
  query,
  get,
  run,
};
