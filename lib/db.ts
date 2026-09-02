import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";

const globalForDb = globalThis as unknown as { aslalPool?: Pool };

export const db = globalForDb.aslalPool ?? mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: "utf8mb4",
});

if (process.env.NODE_ENV !== "production") globalForDb.aslalPool = db;
