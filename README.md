# Alcovia Intervention Engine

A full-stack application for intelligent student monitoring and personalized interventions. The system tracks student performance, detects anomalies, and triggers mentor-led remedial actions to improve learning outcomes.

## 🎯 Project Overview

The Alcovia Intervention Engine is composed of three main components:

- **Server**: Node.js/Express backend with Supabase/Postgres database
- **Client**: React + Vite frontend with real-time WebSocket updates
- **n8n Workflow**: Automated intervention workflow with email notifications

## 📋 Quick Start

### Prerequisites
- Node.js 14+
- pnpm (or npm/yarn)
- PostgreSQL 12+ (or Supabase account)
- n8n instance (optional, for automated workflows)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/alcovia-intervention-engine.git
   cd alcovia-intervention-engine
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - Database credentials (Supabase or Postgres)
   - n8n webhook URL
   - Client/Server URLs for local development

4. **Start the development server**
   ```bash
   pnpm dev
   ```
   This starts both the client (http://localhost:5173) and server (http://localhost:3001)

## 🗂️ Project Structure

```
alcovia-intervention-engine/
├── client/                    # React SPA frontend
│   ├── src/
│   │   ├── components/        # React components (Home, Locked, Remedial)
│   │   ├── hooks/             # Custom hooks (useStudentStatus)
│   │   ├── services/          # API service layer
│   │   └── utils/             # Utilities (cheater detection)
│   └── package.json
│
├── server/                    # Express.js backend
│   ├── src/
│   │   ├── index.js           # Main server entry point
│   │   ├── db.js              # Database configuration
│   │   ├── ws.js              # WebSocket setup
│   │   ├── models/
│   │   │   └── schema.sql     # Database schema
│   │   ├── routes/            # API route handlers
│   │   │   ├── daily.js       # POST /daily-checkin
│   │   │   ├── assign.js      # POST /assign-intervention
│   │   │   └── complete.js    # POST /complete-task
│   │   └── utils/
│   │       └── sendWebhook.js # n8n webhook helper
│   └── package.json
│
├── n8n_workflow/              # n8n automation
│   └── n8n_workflow.json      # Workflow definition
│
├── docker-compose.yml         # Docker setup
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🚀 Key Features

### Daily Check-ins
Students submit focus time and quiz scores daily. The system analyzes performance against configurable thresholds:
- Focus time minimum (default: 60 minutes)
- Quiz score minimum (default: 70%)

### Smart Detection
- Page visibility API monitors suspicious activity
- Window blur detection flags potential cheating
- Automatic webhook triggers on performance issues

### Mentor Interventions
When thresholds are exceeded:
1. System locks student session
2. Sends notification to mentor via n8n
3. Mentor reviews case and assigns remedial task
4. Student completes task to unlock session

### Real-time Updates
- WebSocket connections (Socket.io) for instant status updates
- Live mentor assignment notifications
- Task completion confirmation

## 📚 API Endpoints

### Daily Checkin
```bash
POST /api/daily/checkin
Content-Type: application/json

{
  "studentId": 123,
  "focusMinutes": 75,
  "quizScore": 82,
  "pageVisibilityEvents": 0,
  "cheaterDetected": false
}

Response:
{
  "status": "on_track|needs_intervention",
  "message": "Check-in successful|Analysis in progress...",
  "logId": 45
}
```

### Assign Intervention
```bash
POST /api/interventions/assign
Content-Type: application/json

{
  "studentId": 123,
  "task": "Review Chapter 5 and retake the quiz",
  "mentorNotes": "Student struggled with async concepts"
}

Response:
{
  "success": true,
  "data": {
    "interventionId": 12,
    "studentId": 123,
    "task": "Review Chapter 5 and retake the quiz",
    "status": "remedial",
    "assignedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Complete Task
```bash
POST /api/interventions/complete
Content-Type: application/json

{
  "studentId": 123,
  "interventionId": 12
}

Response:
{
  "success": true,
  "data": {
    "studentId": 123,
    "interventionId": 12,
    "status": "on_track",
    "completedAt": "2024-01-15T14:30:00.000Z",
    "unlockedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

### Get Student Status
```bash
GET /api/student/123

Response:
{
  "success": true,
  "data": {
    "studentId": 123,
    "status": "on_track",
    "currentTask": null,
    "lastCheckinAt": "2024-01-15T14:30:00.000Z",
    "lockedAt": null,
    "unlockedAt": "2024-01-15T14:30:00.000Z",
    "latestIntervention": {
      "id": 12,
      "task": "Review Chapter 5",
      "mentorNotes": "Student struggled with async",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "completedAt": "2024-01-15T14:30:00.000Z"
    }
  }
}
```

## 🧪 Quick Testing with curl

### Test Daily Check-in (Success)
```bash
curl -X POST http://localhost:4000/api/daily/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 123,
    "focusMinutes": 75,
    "quizScore": 85,
    "pageVisibilityEvents": 0,
    "cheaterDetected": false
  }'
```

### Test Daily Check-in (Failure - Triggers Intervention)
```bash
curl -X POST http://localhost:4000/api/daily/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 123,
    "focusMinutes": 45,
    "quizScore": 60,
    "pageVisibilityEvents": 3,
    "cheaterDetected": false
  }'
```

### Assign Intervention (Mentor Action)
```bash
curl -X POST http://localhost:4000/api/interventions/assign \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 123,
    "task": "Complete the async/await tutorial and submit 3 practice exercises",
    "mentorNotes": "Focus on error handling patterns"
  }'
```

### Complete Task (Student Action)
```bash
curl -X POST http://localhost:4000/api/interventions/complete \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 123,
    "interventionId": 12
  }'
```

### Get Student Status
```bash
curl http://localhost:4000/api/student/123
```

### Health Check
```bash
curl http://localhost:4000/health
```

## 🗄️ Database Schema

### Students Table
- `id` (UUID): Primary key
- `student_id` (VARCHAR): Unique student identifier
- `name` (VARCHAR): Student name
- `email` (VARCHAR): Contact email
- `status` (VARCHAR): normal|locked|remedial
- `created_at`, `updated_at`: Timestamps

### Daily Logs Table
- `id` (UUID): Primary key
- `student_id` (VARCHAR): Foreign key to students
- `focus_minutes` (INTEGER): Daily focus time
- `quiz_score` (DECIMAL): Quiz performance
- `page_visibility_events` (INTEGER): Suspicious activity count
- `cheater_detected` (BOOLEAN): Cheating flag
- `created_at`, `updated_at`: Timestamps

### Interventions Table
- `id` (UUID): Primary key
- `student_id` (VARCHAR): Foreign key to students
- `task` (VARCHAR): Assigned remedial task
- `status` (VARCHAR): assigned|completed
- `assigned_at`, `completed_at`: Timestamps
- `mentor_notes` (TEXT): Mentor feedback

## 🔧 Development

### Database Migration
Using PostgreSQL directly:
```bash
psql -U your_user -d alcovia_db -f server/src/models/schema.sql
```

Using Supabase:
```bash
supabase migration up
```

### Seed Data (Optional)
```bash
# Create a seed script in server/src/models/seed.sql
psql -U your_user -d alcovia_db -f server/src/models/seed.sql
```

### Running Tests
```bash
pnpm test
```

### Type Checking
```bash
pnpm typecheck
```

## 🐳 Docker Setup (Optional)

Use `docker-compose.yml` to run the entire stack locally:

```bash
docker-compose up
```

This starts:
- PostgreSQL database (port 5432)
- Express server (port 3001)
- React dev server (port 5173)
- n8n instance (port 5678, optional)

## 📡 n8n Workflow Integration

1. **Export workflow** from n8n or import `n8n_workflow/n8n_workflow.json`
2. **Configure webhook URL** in server `.env`: `N8N_WEBHOOK_URL`
3. **Set up email nodes** with your SMTP credentials
4. **Activate workflow** to start receiving intervention triggers

### Workflow Steps
1. Backend sends webhook on performance issue
2. n8n sends email notification to student & mentor
3. Mentor reviews and approves remedial task
4. n8n posts assignment back to `/api/assign-intervention`
5. 12-hour timeout triggers escalation if no response
6. Upon task completion, confirmation email sent

## 🚢 Deployment

### Deploy Server to Render.com

1. Connect GitHub repository to Render
2. Create new Web Service
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables
6. Deploy

### Deploy Server to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard
4. Redeploy

### Deploy Client to Vercel

1. Connect GitHub repository
2. Configure build settings (Vite default works)
3. Set environment variables (API URLs, Socket URLs)
4. Deploy on push

### Deploy Client to Netlify

1. Connect GitHub repository
2. Build command: `pnpm build:client`
3. Publish directory: `dist/spa`
4. Set environment variables
5. Deploy

## 📝 Recording Loom Video

Document your implementation with a Loom video:
1. Start the application locally
2. Record daily checkin submission
3. Show locked state with mentor waiting
4. Demonstrate mentor assignment via n8n
5. Show task completion and return to normal state
6. Demonstrate cheater detection on page visibility change

Include these timestamps:
- 0:00-1:00 - Project overview and architecture
- 1:00-2:00 - Daily checkin flow
- 2:00-3:00 - Performance detection and locking
- 3:00-4:00 - n8n workflow and intervention assignment
- 4:00-5:00 - Task completion and return to normal

## 🐛 Troubleshooting

### Database Connection Errors
- Verify DATABASE_URL or Supabase credentials in `.env`
- Check database is running: `psql postgresql://...`
- Run schema migration: `psql ... -f schema.sql`

### WebSocket Connection Issues
- Ensure SOCKET_URL matches server URL
- Check CORS origin in `server/src/index.js`
- Verify port 3001 is not blocked

### n8n Webhook Not Triggering
- Verify N8N_WEBHOOK_URL in `.env`
- Test webhook with: `curl -X POST http://localhost:3001/api/daily-checkin -H "Content-Type: application/json" -d '{"studentId":"test","focusMinutes":50}'`
- Check n8n workflow is activated

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [Socket.io Documentation](https://socket.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 💬 Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team
- Check existing documentation

---

**Built with ❤️ for student success**
