import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any = null;

async function openDb() {
  if (!db) {
    db = await open({
      filename: './mydb.sqlite',
      driver: sqlite3.Database
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS opdrachtgevers (
        id TEXT PRIMARY KEY,
        naam TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS opdrachten (
        id TEXT PRIMARY KEY,
        opdrachtgeverId TEXT,
        beschrijving TEXT,
        bedrag REAL,
        gefactureerd INTEGER,
        gearchiveerd INTEGER,
        datum TEXT,
        FOREIGN KEY (opdrachtgeverId) REFERENCES opdrachtgevers(id)
      );
    `);
  }
  return db;
}

export async function getOpdrachtgevers() {
  const db = await openDb();
  return db.all('SELECT * FROM opdrachtgevers');
}

export async function addOpdrachtgever(id: string, naam: string) {
  const db = await openDb();
  await db.run('INSERT INTO opdrachtgevers (id, naam) VALUES (?, ?)', [id, naam]);
}

export async function getOpdrachten() {
  const db = await openDb();
  return db.all('SELECT * FROM opdrachten');
}

export async function addOpdracht(opdracht: any) {
  const db = await openDb();
  await db.run(
    'INSERT INTO opdrachten (id, opdrachtgeverId, beschrijving, bedrag, gefactureerd, gearchiveerd, datum) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [opdracht.id, opdracht.opdrachtgeverId, opdracht.beschrijving, opdracht.bedrag, opdracht.gefactureerd ? 1 : 0, opdracht.gearchiveerd ? 1 : 0, opdracht.datum]
  );
}

export async function updateOpdracht(id: string, updates: any) {
  const db = await openDb();
  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  await db.run(`UPDATE opdrachten SET ${setClause} WHERE id = ?`, [...values, id]);
}