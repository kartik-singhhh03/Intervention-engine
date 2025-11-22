# Alcovia Intervention Engine - Server

Node.js/Express backend with WebSocket support and Supabase/PostgreSQL integration.

## 🚀 Quick Start

### Installation

```bash
cd server
pnpm install
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database - Choose one approach:
# Option 1: Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Option 2: Direct PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/alcovia_db

# n8n Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/YOUR_WEBHOOK_ID

# Performance Thresholds
FOCUS_THRESHOLD=60
QUIZ_THRESHOLD=70
```

### Development

```bash
# Start development server with hot reload
pnpm dev

# Server runs on http://localhost:3001
```

### Production Build

```bash
pnpm build

# Start production server
pnpm start
```

## 📂 Project Structure

```
server/
├── src/
│   ├── index.js              # Express server setup
│   ├── db.js                 # Database initialization
│   ├── ws.js                 # WebSocket (Socket.io) setup
│   ├── models/
│   │   └── schema.sql        # Database schema
│   ├── routes/
│   │   ├── daily.js          # POST /daily-checkin
│   │   ├── assign.js         # POST /assign-intervention
│   │   └── complete.js       # POST /complete-task
│   └── utils/
│       └── sendWebhook.js    # n8n webhook integration
├── package.json
└── README.md
```

## 🗄️ Database Setup

### Using PostgreSQL Directly

1. **Install PostgreSQL** (v12+)

2. **Create database**
   ```bash
   psql -U postgres
   CREATE DATABASE alcovia_db;
   \q
   ```

3. **Run migration**
   ```bash
   psql -U postgres -d alcovia_db -f src/models/schema.sql
   ```

4. **Verify schema**
   ```bash
   psql -U postgres -d alcovia_db
   \dt  # List tables
   \q
   ```

### Using Supabase

1. **Create Supabase project** at https://supabase.com

2. **Get credentials**
   - Project URL ��� `SUPABASE_URL`
   - Anon Key → `SUPABASE_KEY`

3. **Run migration in Supabase SQL Editor**
   ```sql
   -- Paste contents of src/models/schema.sql
   ```

4. **Test connection**
   ```bash
   npm run test:db
   ```

## 📡 API Routes

### POST /api/daily-checkin

Student submits daily performance metrics.

**Request:**
```json
{
  "studentId": "student-123",
  "focusMinutes": 75,
  "quizScore": 82,
  "cheaterDetected": false
}
```

**Response (Normal):**
```json
{
  "status": "normal",
  "message": "Checkin successful",
  "logId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Intervention Needed):**
```json
{
  "status": "locked",
  "message": "Analysis in progress. Waiting for Mentor...",
  "logId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Logic:**
- Checks `focusMinutes` against `FOCUS_THRESHOLD`
- Checks `quizScore` against `QUIZ_THRESHOLD`
- If either threshold exceeded or cheating detected:
  - Sends webhook to n8n
  - Updates student status to "locked"
  - Emits WebSocket update to client

### POST /api/assign-intervention

n8n sends this to assign a remedial task (called by n8n workflow).

**Request:**
```json
{
  "studentId": "student-123",
  "task": "Review Chapter 5 and retake the quiz"
}
```

**Response:**
```json
{
  "success": true,
  "interventionId": "550e8400-e29b-41d4-a716-446655440000",
  "studentId": "student-123",
  "task": "Review Chapter 5 and retake the quiz",
  "status": "assigned"
}
```

**Logic:**
- Creates intervention record
- Updates student status to "remedial"
- Emits WebSocket update with task details

### POST /api/complete-task

Student marks their remedial task as complete.

**Request:**
```json
{
  "studentId": "student-123",
  "interventionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "interventionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "completedAt": "2024-01-15T10:30:00Z"
}
```

**Logic:**
- Updates intervention status to "completed"
- Updates student status back to "normal"
- Emits WebSocket update confirming completion

### GET /api/ping

Health check endpoint.

**Response:**
```json
{
  "message": "pong",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /health

Server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔌 WebSocket Events

Real-time communication via Socket.io.

### Client → Server Events

**userSubscribe**
```javascript
socket.emit('userSubscribe', 'student-123');
```
Subscribe to updates for a specific student.

**statusUpdate**
```javascript
socket.emit('statusUpdate', {
  studentId: 'student-123',
  status: 'locked',
  message: 'Analysis in progress'
});
```

**cheater**
```javascript
socket.emit('cheater', {
  studentId: 'student-123'
});
```

### Server → Client Events

**statusUpdate**
```javascript
socket.on('statusUpdate', (data) => {
  // { status, message, timestamp }
});
```

**cheaterDetected**
```javascript
socket.on('cheaterDetected', (data) => {
  // { message, timestamp }
});
```

## 🔗 n8n Integration

The server sends webhook notifications to n8n when students need intervention.

**Webhook Payload:**
```json
{
  "studentId": "student-123",
  "focusMinutes": 45,
  "quizScore": 60,
  "cheaterDetected": true,
  "reason": "Low focus time: 45 minutes (threshold: 60); Low quiz score: 60 (threshold: 70)"
}
```

**n8n Workflow:**
1. Receives webhook from backend
2. Validates student ID
3. Sends email to student and mentor
4. Waits for mentor decision (via webhook)
5. Posts to `/api/assign-intervention` if approved
6. Escalates after 12 hours if no response

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t alcovia-server .
```

### Run Docker Container

```bash
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e N8N_WEBHOOK_URL="..." \
  alcovia-server
```

### Docker Compose

From root directory:
```bash
docker-compose up server
```

## 📦 Dependencies

Key packages:
- **express**: Web framework
- **socket.io**: Real-time WebSocket support
- **pg**: PostgreSQL client
- **@supabase/supabase-js**: Supabase client
- **dotenv**: Environment variable management
- **cors**: CORS middleware
- **body-parser**: Request parsing

## 🧪 Testing

### Test Database Connection

```bash
npm run test:db
```

### Test API Endpoints

```bash
# Test daily checkin
curl -X POST http://localhost:3001/api/daily-checkin \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test-student-123",
    "focusMinutes": 75,
    "quizScore": 85
  }'

# Test assign intervention
curl -X POST http://localhost:3001/api/assign-intervention \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test-student-123",
    "task": "Review materials and retake quiz"
  }'

# Test complete task
curl -X POST http://localhost:3001/api/complete-task \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "test-student-123",
    "interventionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

## 🚢 Deployment

### Deploy to Render.com

1. **Connect GitHub repository**
2. **Create Web Service**
3. **Set build command**: `pnpm install`
4. **Set start command**: `node src/index.js`
5. **Add environment variables**:
   - `DATABASE_URL`
   - `SUPABASE_URL` (if using Supabase)
   - `SUPABASE_KEY` (if using Supabase)
   - `N8N_WEBHOOK_URL`
   - `CLIENT_URL`
   - `FOCUS_THRESHOLD`
   - `QUIZ_THRESHOLD`
6. **Deploy**

### Deploy to Vercel with Serverless

1. **Create `api/intervention.js`** as serverless function
2. **Export handler from Express app**
3. **Set environment variables in Vercel dashboard**
4. **Deploy**: `vercel`

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create alcovia-server

# Add Postgres add-on
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set N8N_WEBHOOK_URL="..."

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` file
2. **CORS**: Configure `CLIENT_URL` for specific origins
3. **Rate Limiting**: Consider adding rate limiting middleware
4. **Input Validation**: Validate all user inputs (consider Zod)
5. **SQL Injection**: Use parameterized queries (pg does this by default)
6. **WebSocket Authentication**: Add auth tokens for Socket.io connections

## 📝 Logging

Logs go to console in development. For production:
- Consider Winston or Pino logger
- Send logs to monitoring service (e.g., Sentry)
- Track performance metrics (APM)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

### Database Connection Fails
```bash
# Check connection string format
# For Postgres: postgresql://user:password@host:port/database
# Verify credentials and network access

# Test with psql
psql postgresql://user:password@host:port/database
```

### WebSocket Won't Connect
- Check CORS origin matches client URL
- Verify port 3001 is accessible
- Check firewall rules

### n8n Webhook Not Received
```bash
# Test webhook directly
curl -X POST http://localhost:3001/api/daily-checkin \
  -H "Content-Type: application/json" \
  -d '{"studentId":"test","focusMinutes":50,"quizScore":60}'

# Check n8n webhook URL is correct
# Verify n8n is running and webhook is active
```

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [Socket.io Docs](https://socket.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Node.js Docs](https://nodejs.org/docs/)

---

**Happy coding! 🎉**
