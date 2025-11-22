# 🔧 Environment Setup - Alcovia Intervention Engine

## Prerequisites

- **Node.js**: v18+ (v20 recommended)
- **pnpm**: v8+ (or npm/yarn)
- **PostgreSQL**: v14+ (local or Supabase)
- **Git**: For version control

---

## 📦 Installation Steps

### 1. Clone Repository (if applicable)
```bash
git clone <repository-url>
cd spark-works
```

### 2. Install Dependencies

#### Root (Frontend + Shared)
```bash
pnpm install
```

#### Backend
```bash
cd server
pnpm install
cd ..
```

---

## 🔐 Environment Variables

### Root `.env` (Frontend)
Create `.env` in project root:

```env
# Frontend Configuration
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000

# Optional: For production deployment
# VITE_API_URL=https://your-api-domain.com/api
# VITE_SOCKET_URL=https://your-api-domain.com
```

### Backend `.env` (Server)
Create `server/.env`:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/alcovia_db

# Alternative: Supabase Database URL
# DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

# Webhook Configuration (Optional - for n8n integration)
N8N_FAILURE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/student-failure

# Security (Optional - for webhook authentication)
BACKEND_SECRET=your-secure-random-string-here

# Frontend CORS (Optional - for production)
CLIENT_URL=http://localhost:8080
# CLIENT_URL=https://your-frontend-domain.com
```

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

#### Install PostgreSQL
**macOS** (Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows** (Installer):
- Download from: https://www.postgresql.org/download/windows/
- Run installer and follow prompts

**Linux** (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE alcovia_db;

# Create user (optional)
CREATE USER alcovia_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE alcovia_db TO alcovia_user;

# Exit psql
\q
```

#### Update DATABASE_URL
```env
DATABASE_URL=postgresql://alcovia_user:your_password@localhost:5432/alcovia_db
```

---

### Option 2: Supabase (Cloud PostgreSQL)

#### Create Supabase Project
1. Go to: https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Choose organization, enter project name
5. Set database password (save this!)
6. Choose region (closest to your users)
7. Wait for project to initialize (~2 minutes)

#### Get Connection String
1. In Supabase dashboard, go to: **Settings** → **Database**
2. Scroll to **Connection String** section
3. Copy **Connection pooling** → **URI** format
4. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres.your-project-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### Update DATABASE_URL
```env
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 🏗️ Database Migration

### Run Schema Migration
```bash
cd server
pnpm migrate
```

This will create tables:
- `students` - Student records with status
- `daily_logs` - Daily check-in records
- `interventions` - Mentor-assigned tasks

### Verify Tables
```bash
# Using psql
psql $DATABASE_URL -c "\dt"

# Should show:
# public | students       | table | ...
# public | daily_logs     | table | ...
# public | interventions  | table | ...
```

---

## 🧪 Verify Setup

### Check Backend
```bash
cd server
pnpm dev
```

Expected output:
```
✅ Database connected successfully
🚀 Server running on port 4000
✅ WebSocket server initialized
```

Test with curl:
```bash
curl http://localhost:4000/api/ping
# Response: {"message":"pong","timestamp":"..."}
```

### Check Frontend
```bash
# In new terminal, from project root
pnpm dev
```

Expected output:
```
VITE v7.1.2  ready in X ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

Open browser: `http://localhost:8080?studentId=test-123`

Should see: **Pink-purple-blue gradient screen** with "👋 Hey Super Learner!"

---

## 🔥 Common Setup Issues

### Issue: `pnpm` command not found
**Solution:**
```bash
npm install -g pnpm
```

### Issue: PostgreSQL connection refused
**Solutions:**
- Check PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Verify port 5432 is not blocked by firewall
- Check DATABASE_URL format and credentials

### Issue: Port 4000 or 8080 already in use
**Solutions:**
```bash
# Kill process on port 4000 (macOS/Linux)
lsof -ti:4000 | xargs kill -9

# Kill process on port 4000 (Windows)
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change port in server/.env and .env
```

### Issue: Table does not exist
**Solution:**
```bash
# Rerun migration
cd server
pnpm migrate
```

### Issue: CORS error in browser console
**Solution:**
Add to `server/.env`:
```env
CLIENT_URL=http://localhost:8080
```

And verify `server/src/index.js` has:
```javascript
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true
};
app.use(cors(corsOptions));
```

---

## 🌐 n8n Webhook Setup (Optional)

### Create n8n Workflow
1. Create n8n account: https://n8n.io
2. Create new workflow
3. Add **Webhook** node:
   - HTTP Method: POST
   - Path: `/webhook/student-failure`
4. Add **Send Email** / **Slack** / **Discord** node
5. Activate workflow
6. Copy webhook URL

### Update Backend .env
```env
N8N_FAILURE_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/student-failure
BACKEND_SECRET=your-secret-key
```

### Test Webhook
```bash
curl -X POST http://localhost:4000/api/daily/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test-123",
    "focusMinutes": 30,
    "quizScore": 5,
    "pageVisibilityEvents": 0,
    "cheaterDetected": false
  }'
```

Should trigger n8n workflow and send notification.

---

## 📚 Testing Data Setup

### Insert Test Student
```sql
INSERT INTO students (student_id, name, status) 
VALUES 
  ('alice-2024', 'Alice Johnson', 'on_track'),
  ('bob-2024', 'Bob Smith', 'on_track');
```

### Test URLs
- Alice: `http://localhost:8080?studentId=alice-2024`
- Bob: `http://localhost:8080?studentId=bob-2024`

---

## 🚀 Production Deployment

### Backend (Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables:
   - `DATABASE_URL` (from Supabase)
   - `N8N_FAILURE_WEBHOOK_URL`
   - `BACKEND_SECRET`
   - `CLIENT_URL` (frontend domain)
4. Deploy
5. Note backend URL: `https://your-app.railway.app`

### Frontend (Netlify/Vercel)
1. Run: `pnpm build`
2. Deploy `dist/` folder to Netlify/Vercel
3. Set environment variables:
   - `VITE_API_URL=https://your-backend.railway.app/api`
   - `VITE_SOCKET_URL=https://your-backend.railway.app`
4. Note frontend URL: `https://your-app.netlify.app`

### Update CORS
In `server/.env`:
```env
CLIENT_URL=https://your-app.netlify.app
```

---

## ✅ Setup Complete Checklist

- [ ] Node.js v18+ installed
- [ ] pnpm installed globally
- [ ] PostgreSQL running (local or Supabase)
- [ ] Root `.env` created with VITE_API_URL and VITE_SOCKET_URL
- [ ] Backend `server/.env` created with DATABASE_URL
- [ ] Dependencies installed (`pnpm install` in root and server/)
- [ ] Database migration run (`pnpm migrate`)
- [ ] Backend starts without errors (`pnpm dev`)
- [ ] Frontend starts without errors (`pnpm dev`)
- [ ] Browser shows Normal component at `localhost:8080`
- [ ] WebSocket connection established (check console)
- [ ] curl test to `/api/ping` returns pong
- [ ] Test student records inserted (optional)
- [ ] n8n webhook configured (optional)

---

## 🎉 You're Ready!

Once all checklist items are complete, follow **QUICK_START.md** for end-to-end testing.

For detailed component documentation, see **FRONTEND_COMPLETE.md**.

For API reference, see **server/README.md**.
