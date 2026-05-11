import * as SQLite from 'expo-sqlite';
import { Incident } from '../store/useIncidentStore';

const DB_NAME = 'kiago_incidents.db';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      flowId TEXT NOT NULL
    );
  `);
};

export const saveIncidentToDb = async (incident: Incident) => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const dataString = JSON.stringify(incident);
  
  await db.runAsync(
    'INSERT OR REPLACE INTO incidents (id, data, createdAt, flowId) VALUES (?, ?, ?, ?)',
    [incident.id, dataString, incident.createdAt, incident.flowId]
  );
};

export const getAllIncidents = async (): Promise<Incident[]> => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const allRows = await db.getAllAsync<{ data: string }>('SELECT data FROM incidents ORDER BY createdAt DESC');
  
  return allRows.map(row => JSON.parse(row.data));
};
