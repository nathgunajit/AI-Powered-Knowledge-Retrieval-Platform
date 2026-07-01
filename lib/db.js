import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "app.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH);
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        originalName TEXT NOT NULL,
        storedName TEXT NOT NULL,
        size INTEGER NOT NULL,
        mimeType TEXT,
        uploadedAt TEXT NOT NULL
      )
    `);
  }
  return db;
}

export function insertDocument(doc) {
  return new Promise((resolve, reject) => {
    getDb().run(
      `INSERT INTO documents (id, originalName, storedName, size, mimeType, uploadedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [doc.id, doc.originalName, doc.storedName, doc.size, doc.mimeType, doc.uploadedAt],
      (err) => (err ? reject(err) : resolve(doc))
    );
  });
}

export function listDocuments() {
  return new Promise((resolve, reject) => {
    getDb().all(
      `SELECT * FROM documents ORDER BY uploadedAt DESC`,
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
}
