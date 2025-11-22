import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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

async function seedStudent() {
  try {
    console.log('🌱 Seeding test student...');
    
    // Insert test student with alice-2024 ID
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
    console.log('🎉 You can now use studentId: alice-2024');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding student:', error);
    await pool.end();
    process.exit(1);
  }
}

seedStudent();
