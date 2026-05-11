import * as SQLite from "expo-sqlite";
import { Incident } from "../store/useIncidentStore";

const DB_NAME = "kiago_v1.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  return dbInstance;
};

export const initDatabase = async () => {
  console.log("Starting DB Init with name:", DB_NAME);
  try {
    const db = await getDb();
    console.log("DB connection established");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY NOT NULL,
        data TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        flowId TEXT NOT NULL
      );
    `);
    console.log("DB Initialized successfully");
  } catch (error) {
    console.error("DB Init Error (caught):", error);
  }
};

export const saveIncidentToDb = async (incident: Incident) => {
  try {
    const db = await getDb();
    const dataString = JSON.stringify(incident);
    const timestamp = new Date(incident.createdAt).getTime();

    const id = incident.id || `temp-${Date.now()}`;
    const flowId = incident.flowId || "default";

    console.log("Saving incident:", { id, timestamp, flowId });

    await db.runAsync(
      "INSERT OR REPLACE INTO incidents (id, data, createdAt, flowId) VALUES (?, ?, ?, ?)",
      [id, dataString, timestamp, flowId],
    );
    console.log("Save successful");
  } catch (error) {
    console.error("Save error:", error);
    throw error;
  }
};

export const getAllIncidents = async (): Promise<Incident[]> => {
  try {
    const db = await getDb();
    const allRows = await db.getAllAsync<{ data: string }>(
      "SELECT data FROM incidents ORDER BY createdAt DESC LIMIT 10",
    );

    return allRows.map((row) => JSON.parse(row.data));
  } catch (error) {
    console.error("Get all incidents error:", error);
    return [];
  }
};
