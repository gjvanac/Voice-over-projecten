import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any = null;

async function openDb() {
  if (db) return db;

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
      maand TEXT,
      FOREIGN KEY (opdrachtgeverId) REFERENCES opdrachtgevers(id)
    );
  `);

  return db;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await openDb();

    if (req.method === 'GET') {
      if (req.query.type === 'opdrachtgevers') {
        const opdrachtgevers = await db.all('SELECT * FROM opdrachtgevers');
        res.status(200).json(opdrachtgevers);
      } else if (req.query.type === 'opdrachten') {
        const opdrachten = await db.all('SELECT * FROM opdrachten');
        res.status(200).json(opdrachten);
      } else {
        res.status(400).json({ message: 'Invalid query type' });
      }
    } else if (req.method === 'POST') {
      if (req.query.type === 'opdrachtgever') {
        const { id, naam } = req.body;
        await db.run('INSERT INTO opdrachtgevers (id, naam) VALUES (?, ?)', [id, naam]);
        res.status(200).json({ message: 'Opdrachtgever toegevoegd' });
      } else if (req.query.type === 'opdracht') {
        const { id, opdrachtgeverId, beschrijving, bedrag, gefactureerd, gearchiveerd, datum, maand } = req.body;
        await db.run(
          'INSERT INTO opdrachten (id, opdrachtgeverId, beschrijving, bedrag, gefactureerd, gearchiveerd, datum, maand) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, opdrachtgeverId, beschrijving, bedrag, gefactureerd ? 1 : 0, gearchiveerd ? 1 : 0, datum, maand]
        );
        res.status(200).json({ message: 'Opdracht toegevoegd' });
      } else {
        res.status(400).json({ message: 'Invalid query type' });
      }
    } else if (req.method === 'PUT') {
      if (req.query.type === 'opdrachtgever') {
        const { id, naam } = req.body;
        await db.run('UPDATE opdrachtgevers SET naam = ? WHERE id = ?', [naam, id]);
        res.status(200).json({ message: 'Opdrachtgever bijgewerkt' });
      } else if (req.query.type === 'opdracht') {
        const { id, opdrachtgeverId, beschrijving, bedrag, gefactureerd, gearchiveerd, datum, maand } = req.body;
        await db.run(
          'UPDATE opdrachten SET opdrachtgeverId = ?, beschrijving = ?, bedrag = ?, gefactureerd = ?, gearchiveerd = ?, datum = ?, maand = ? WHERE id = ?',
          [opdrachtgeverId, beschrijving, bedrag, gefactureerd ? 1 : 0, gearchiveerd ? 1 : 0, datum, maand, id]
        );
        res.status(200).json({ message: 'Opdracht bijgewerkt' });
      } else {
        res.status(400).json({ message: 'Invalid query type' });
      }
    } else if (req.method === 'DELETE') {
      if (req.query.type === 'opdrachtgever') {
        const { id } = req.query;
        await db.run('DELETE FROM opdrachtgevers WHERE id = ?', [id]);
        res.status(200).json({ message: 'Opdrachtgever verwijderd' });
      } else if (req.query.type === 'opdracht') {
        const { id } = req.query;
        await db.run('DELETE FROM opdrachten WHERE id = ?', [id]);
        res.status(200).json({ message: 'Opdracht verwijderd' });
      } else {
        res.status(400).json({ message: 'Invalid query type' });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
 } catch (error) {
  console.error('API route error:', error);
  if (error instanceof Error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } else {
    res.status(500).json({ message: 'Internal server error', error: 'An unknown error occurred' });
    }
  }
}
