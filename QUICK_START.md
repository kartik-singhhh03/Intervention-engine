# 🚀 Quick Start Guide - Alcovia Intervention Engine

## Start the Application

### 1. Start Backend Server
```bash
cd server
pnpm install
pnpm dev
```
Backend runs on: **http://localhost:4000**

### 2. Start Frontend (in new terminal)
```bash
cd ..
pnpm install
pnpm dev
```
Frontend runs on: **http://localhost:8080**

---

## 🧪 Test the Complete Flow

### Test URL Format:
```
http://localhost:8080?studentId=YOUR_STUDENT_ID
```

### Sample Test URLs:
- `http://localhost:8080?studentId=alice-2024`
- `http://localhost:8080?studentId=bob-2024`
- `http://localhost:8080?studentId=charlie-2024`

---

## 📋 Complete User Journey Test

### Step 1: Initial Check-in (Success Path)
1. Open: `http://localhost:8080?studentId=alice-2024`
2. You should see the **Normal** component (pink gradient)
3. Enter values:
   - Focus Minutes: `65` ✅ (above 60 threshold)
   - Quiz Score: `8` ✅ (above 7 threshold)
4. Click **"Let's Go! 🚀"**
5. Expected: Success message, status remains `on_track`

### Step 2: Failed Check-in (Triggers Intervention)
1. Refresh page or open new tab with same studentId
2. Enter values:
   - Focus Minutes: `30` ❌ (below threshold)
   - Quiz Score: `5` ❌ (below threshold)
3. Click **"Let's Go! 🚀"**
4. Expected:
   - Backend sets status to `needs_intervention`
   - n8n webhook called (if configured)
   - UI transitions to **Locked** component (orange gradient)
   - See message: "⏳ Analysis in progress..."

### Step 3: Mentor Assigns Task (Backend Action)
Using curl or Postman:
```bash
curl -X POST http://localhost:4000/api/interventions/assign \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "alice-2024",
    "task": "Complete Chapter 5 Math exercises (pages 45-50) and submit worksheet."
  }'
```

Expected:
- Backend sets status to `remedial`
- WebSocket emits status update
- UI automatically transitions to **Remedial** component (purple gradient)
- Task is displayed in the UI

### Step 4: Student Completes Task
1. On Remedial screen, read the task
2. Click **"✓ Mark Complete"** button
3. Expected:
   - POST to `/api/interventions/complete`
   - Backend sets status back to `on_track`
   - WebSocket emits status update
   - UI transitions back to **Normal** component
   - Success celebration screen (🎉)

---

## 🔍 Check Backend Logs

### Server Console Should Show:
```
✅ Connected to WebSocket server
📡 Subscribed to room: student_alice-2024
✅ Check-in submitted: {...}
🚨 Tab hidden detected! Count: 1
📥 Status update received: { status: 'needs_intervention' }
```

### Database Queries to Verify:
```sql
-- Check student status
SELECT * FROM students WHERE student_id = 'alice-2024';

-- Check daily logs
SELECT * FROM daily_logs WHERE student_id = 'alice-2024' ORDER BY created_at DESC LIMIT 5;

-- Check interventions
SELECT * FROM interventions WHERE student_id = 'alice-2024' ORDER BY created_at DESC;
```

---

## 🐛 Test Cheater Detection

### While on Normal Screen:
1. Press `Alt + Tab` (or `Cmd + Tab` on Mac) to switch windows
2. Check browser console: Should see `🚨 Window blur detected! Count: 1`
3. Switch back and forth 3 times
4. Submit check-in form
5. Check backend logs: Should log `cheaterDetected: true` and `page_visibility_events: 3`

### Database Check:
```sql
SELECT student_id, cheater_detected, page_visibility_events 
FROM daily_logs 
WHERE student_id = 'alice-2024' 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🎯 API Endpoints Quick Reference

### Student Check-in
```bash
curl -X POST http://localhost:4000/api/daily/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "alice-2024",
    "focusMinutes": 65,
    "quizScore": 8,
    "pageVisibilityEvents": 2,
    "cheaterDetected": true
  }'
```

### Get Student Data
```bash
curl http://localhost:4000/api/student/alice-2024
```

### Assign Intervention (Mentor Action)
```bash
curl -X POST http://localhost:4000/api/interventions/assign \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "alice-2024",
    "task": "Review Chapter 3 and complete practice problems"
  }'
```

### Complete Task (Student Action)
```bash
curl -X POST http://localhost:4000/api/interventions/complete \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "alice-2024",
    "interventionId": 1
  }'
```

---

## 🌐 WebSocket Events Monitor

### Using Browser DevTools Console:
```javascript
// Monitor all WebSocket events
const socket = io('http://localhost:4000');

socket.on('connect', () => console.log('✅ Connected'));
socket.on('subscribed', (data) => console.log('📡 Subscribed:', data));
socket.on('status', (data) => console.log('📥 Status Update:', data));
socket.on('cheater_event', (data) => console.log('🚨 Cheater Event:', data));

// Subscribe to a student room
socket.emit('subscribe', { student_id: 'alice-2024' });

// Manually trigger status update (for testing)
socket.emit('status', { 
  status: 'remedial', 
  task: 'Test task',
  interventionId: 123
});
```

---

## ⚠️ Troubleshooting

### Issue: Frontend shows "Connecting..." forever
**Solution:**
- Check backend is running on port 4000
- Check WebSocket connection in DevTools Network tab
- Verify `VITE_SOCKET_URL` in `.env`

### Issue: Form submission fails with 404
**Solution:**
- Verify backend routes are mounted at `/api` prefix
- Check `VITE_API_URL=http://localhost:4000/api`
- Restart backend server

### Issue: UI doesn't transition after status change
**Solution:**
- Check browser console for WebSocket events
- Verify backend is emitting status with `emitStatus()` helper
- Check room name format: `student_${studentId}`

### Issue: Cheater detection not working
**Solution:**
- Verify `startCheaterDetection(socket, studentId)` is called in App.jsx
- Check socket is connected before calling
- Try clicking outside browser window (not just switching tabs)

### Issue: Database connection errors
**Solution:**
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Run migration: `pnpm migrate`

---

## 📊 Success Criteria Checklist

After running all tests, verify:
- [ ] Normal component displays with playful design
- [ ] Form inputs accept values and show validation
- [ ] Successful check-in shows success message
- [ ] Failed check-in triggers status change to `needs_intervention`
- [ ] UI transitions to Locked screen automatically
- [ ] Mentor can assign task via API
- [ ] UI transitions to Remedial screen with task displayed
- [ ] Student can complete task
- [ ] UI transitions back to Normal screen
- [ ] Cheater detection logs events in console
- [ ] WebSocket events appear in browser DevTools
- [ ] Database records match expected state
- [ ] n8n webhook receives failure notification (if configured)

---

## 🎨 Visual Verification

### Normal Screen (on_track)
- [ ] Pink-purple-blue gradient background
- [ ] Large "👋 Hey Super Learner!" heading
- [ ] Two rounded input boxes with emoji labels
- [ ] Large gradient button at bottom
- [ ] No errors in console

### Locked Screen (needs_intervention)
- [ ] Amber-orange gradient background
- [ ] Animated hourglass emoji (⏳) bouncing
- [ ] "Analysis in progress..." with dots
- [ ] 4 loading dots animating in sequence
- [ ] Friendly encouragement message

### Remedial Screen (remedial)
- [ ] Purple-pink gradient background
- [ ] Book emoji (📘) at top
- [ ] "Your Mentor Has Given You a Task!" heading
- [ ] Task displayed in rounded gradient box
- [ ] 3 numbered instruction steps
- [ ] Large "✓ Mark Complete" button

---

## 🚀 Ready to Deploy?

Once all tests pass, you can:
1. Set production environment variables
2. Build frontend: `pnpm build`
3. Deploy backend to cloud service (Railway, Render, etc.)
4. Deploy frontend to Netlify/Vercel
5. Update CORS and WebSocket URLs
6. Configure production PostgreSQL database
7. Set up n8n webhook URL

---

## 📞 Need Help?

Check these files for detailed documentation:
- **FRONTEND_COMPLETE.md** - Complete frontend implementation details
- **README.md** - Backend setup and API documentation
- **server/README.md** - Database schema and route details
- **AGENTS.md** - Project architecture overview

---

🎉 **Happy Testing!** The Alcovia Intervention Engine is ready to help students succeed!
