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
        uploadedAt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'processing',
        error TEXT
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        documentId TEXT NOT NULL,
        chunkIndex INTEGER NOT NULL,
        text TEXT NOT NULL,
        embedding TEXT NOT NULL,
        FOREIGN KEY (documentId) REFERENCES documents(id)
      )
    `);
  }
  return db;
}

export function insertDocument(doc) {
  return new Promise((resolve, reject) => {
    getDb().run(
      `INSERT INTO documents (id, originalName, storedName, size, mimeType, uploadedAt, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [doc.id, doc.originalName, doc.storedName, doc.size, doc.mimeType, doc.uploadedAt, doc.status || "processing"],
      (err) => (err ? reject(err) : resolve(doc))
    );
  });
}

export function updateDocumentStatus(id, status, error = null) {
  return new Promise((resolve, reject) => {
    getDb().run(
      `UPDATE documents SET status = ?, error = ? WHERE id = ?`,
      [status, error, id],
      (err) => (err ? reject(err) : resolve())
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

export function insertChunk(chunk) {
  return new Promise((resolve, reject) => {
    getDb().run(
      `INSERT INTO chunks (id, documentId, chunkIndex, text, embedding) VALUES (?, ?, ?, ?, ?)`,
      [chunk.id, chunk.documentId, chunk.chunkIndex, chunk.text, JSON.stringify(chunk.embedding)],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

export function getAllChunksWithDocuments() {
  return new Promise((resolve, reject) => {
    getDb().all(
      `SELECT chunks.id, chunks.documentId, chunks.chunkIndex, chunks.text, chunks.embedding,
              documents.originalName
       FROM chunks
       JOIN documents ON documents.id = chunks.documentId
       WHERE documents.status = 'ready'`,
      (err, rows) => {
        if (err) return reject(err);
        resolve(
          rows.map((row) => ({
            ...row,
            embedding: JSON.parse(row.embedding),
          }))
        );
      }
    );
  });
}
