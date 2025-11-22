import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server directory
dotenv.config({ path: join(__dirname, '../.env') });

let db = null;
let supabase = null;

// Use Supabase if available, otherwise use Postgres directly
export const initDB = async () => {
  const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;

  if (useSupabase) {
    console.log('🔌 Connecting to Supabase...');
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    console.log('✅ Supabase client initialized');
    return supabase;
  } else if (process.env.DATABASE_URL) {
    console.log('🔌 Connecting to PostgreSQL...');
    // Use pg pool for direct Postgres connection
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
    };
    
    // Enable SSL for production (e.g., Heroku, Render)
    if (process.env.NODE_ENV === 'production') {
      poolConfig.ssl = {
        rejectUnauthorized: false
      };
    }
    
    db = new pg.Pool(poolConfig);
    
    db.on('error', (err) => {
      console.error('❌ Unexpected error on idle client:', err);
      process.exit(-1);
    });
    
    // Test connection
    try {
      await db.query('SELECT NOW()');
      console.log('✅ PostgreSQL connected successfully');
    } catch (err) {
      console.error('❌ Failed to connect to PostgreSQL:', err.message);
      throw err;
    }
    
    return db;
  } else {
    const error = new Error('❌ No database credentials provided. Set DATABASE_URL or SUPABASE_URL/SUPABASE_KEY in .env');
    console.error(error.message);
    throw error;
  }
};

export const getDB = () => {
  if (supabase) return supabase;
  if (db) return db;
  throw new Error('Database not initialized');
};

// Clean query helper for pg Pool
export const query = async (text, params = []) => {
  if (supabase) {
    // For Supabase, handle queries differently
    console.warn('⚠️ Direct SQL queries not supported with Supabase client');
    return null;
  }
  
  if (!db) {
    throw new Error('❌ Database not initialized. Call initDB() first.');
  }
  
  try {
    const result = await db.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

export const closeDB = async () => {
  if (db) {
    await db.end();
  }
};
