import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import pkg from 'pg';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDatabase() {
  try {
    console.log('📊 Initializing database schema...');
    
    // Read schema file
    const schemaPath = join(__dirname, 'src', 'models', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Insert test student with alice-2024 ID
    console.log('🌱 Seeding test student...');
    const result = await pool.query(
      `INSERT INTO students (student_id, name, email, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id) DO UPDATE
       SET name = EXCLUDED.name,
           email = EXCLUDED.email,
           status = EXCLUDED.status,
           updated_at = NOW()
       RETURNING *`,
      ['alice-2024', 'Alice Johnson', 'alice@example.com', 'on_track']
    );
    
    console.log('✅ Test student created:', result.rows[0]);
    console.log('🎉 Database ready! You can now use studentId: alice-2024');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();
