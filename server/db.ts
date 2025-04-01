import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "@shared/schema";
import { MemoryStorage } from "./memory-storage";

// This will be set to true if PostgreSQL connection is successful
let dbConnected = false;

// Function to attempt PostgreSQL connection
async function attemptPostgresConnection() {
  try {
    // Use direct connection parameters instead of connection string
    if (!process.env.PGHOST || !process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGDATABASE) {
      console.warn("Database environment variables are not completely set");
      return false;
    }

    // Create pool with improved configuration
    const pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: { rejectUnauthorized: false },
      // Connection timeout (ms)
      connectionTimeoutMillis: 5000,
      // Short idle timeout for quick testing
      idleTimeoutMillis: 10000,
      max: 5
    });

    // Add event listeners for connection issues
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      dbConnected = false;
    });

    // Test the connection with a timeout
    const connectionResult = await Promise.race([
      pool.query('SELECT NOW()'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);

    if (connectionResult) {
      console.log('Database connected successfully at:', connectionResult.rows[0].now);
      dbConnected = true;
      return { success: true, pool };
    }
  } catch (err) {
    console.error('Database connection failed:', err);
    dbConnected = false;
    return { success: false };
  }
  
  return { success: false };
}

// Attempt to connect to PostgreSQL
const connectionAttempt = await attemptPostgresConnection();

// Create pool and db only if connection was successful
const pool = connectionAttempt.success ? connectionAttempt.pool : null;

// For type safety, we'll create a db instance even if it might not be used
export const db = pool ? drizzle(pool, { schema }) : null;

// IMPORTANT: This function allows the server to gracefully fall back to memory storage if PostgreSQL fails,
// but still use PostgreSQL if it becomes available later
export async function getStorage() {
  // If we've already successfully connected to PostgreSQL, use DatabaseStorage
  if (dbConnected && db) {
    const { DatabaseStorage } = await import('./storage');
    return new DatabaseStorage();
  }
  
  // If PostgreSQL connection failed, fall back to MemoryStorage
  console.warn('Using MemoryStorage as fallback due to database connection issues');
  return new MemoryStorage();
}
