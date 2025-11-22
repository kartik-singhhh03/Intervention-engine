# Alcovia Intervention Engine - Client

Modern React + Vite frontend with real-time WebSocket integration.

## 🚀 Quick Start

### Installation

```bash
cd client
pnpm install
```

### Environment Setup

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### Development

```bash
# Start dev server with hot reload
pnpm dev

# Opens at http://localhost:5173
```

### Production Build

```bash
pnpm build

# Preview production build
pnpm preview
```

## 📂 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Home.jsx          # Daily checkin interface
│   │   ├── Locked.jsx        # Waiting for mentor state
│   │   └── Remedial.jsx      # Task completion interface
│   ├── hooks/
│   │   └── useStudentStatus.js     # Real-time status management
│   ├── services/
│   │   └── api.js            # API communication
│   ├── utils/
│   │   └── cheaterDetection.js     # Suspicious activity detection
│   ├── main.jsx              # App entry point
│   └── styles.css            # Global styles
├── public/                   # Static assets
├── index.html
├── package.json
└── README.md
```

## 🎨 Component Overview

### Home Component
Daily checkin interface where students submit:
- Focus minutes (time spent on focused learning)
- Quiz score (0-100)

**Features:**
- Real-time validation
- Loading states
- Error handling
- Modern gradient UI with Tailwind CSS
- Responsive design

**Usage:**
```jsx
import Home from './components/Home';

<Home studentId="student-123" />
```

### Locked Component
Displayed when system detects performance issues or suspicious activity.

**Features:**
- Animated loading indicator
- Mentor waiting message
- Auto-updating status via WebSocket
- Beautiful UI with lock icon
- Estimated response time tips

**Usage:**
```jsx
import Locked from './components/Locked';

<Locked studentId="student-123" />
```

### Remedial Component
Shows assigned remedial task and allows completion marking.

**Features:**
- Task display
- Step-by-step instructions
- Task completion button
- Success state with confirmation
- Loading and error states

**Usage:**
```jsx
import Remedial from './components/Remedial';

<Remedial studentId="student-123" interventionId="intervention-uuid" />
```

## 🪝 Custom Hooks

### useStudentStatus
Manages real-time student status with WebSocket.

**Returns:**
```javascript
{
  status,           // 'normal' | 'locked' | 'remedial'
  message,          // Status message from server
  currentTask,      // Current remedial task if any
  emitStatusUpdate, // Function to emit status updates
  emitCheater,      // Function to report cheating
  socket            // Socket.io connection
}
```

**Example:**
```javascript
import { useStudentStatus } from '../hooks/useStudentStatus';

function MyComponent() {
  const { status, message } = useStudentStatus('student-123');
  
  return <div>{message}</div>;
}
```

## 🔧 API Service

Fetch wrappers for backend communication.

**Functions:**
```javascript
// Submit daily checkin
submitDailyCheckin(studentId, focusMinutes, quizScore, cheaterDetected)

// Get current status
getStatus(studentId)

// Complete remedial task
completeTask(studentId, interventionId)

// Ping server
ping()
```

**Example:**
```javascript
import { submitDailyCheckin } from '../services/api';

const response = await submitDailyCheckin('student-123', 75, 85, false);
console.log(response.status); // 'normal' or 'locked'
```

## 👁️ Cheater Detection

Automatic detection of suspicious activity using Page Visibility API.

**Detected Events:**
- Page becomes hidden (tab switch, window minimized)
- Window loses focus (blur event)
- Navigation away from page

**Implementation:**
```javascript
import { useCheaterDetection } from '../utils/cheaterDetection';

function MyComponent() {
  const { setupListeners, removeListeners } = useCheaterDetection(
    (data) => {
      console.log('Suspicious activity:', data);
      // Send to backend
    }
  );

  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, []);
}
```

## 🌐 Real-time Updates

Socket.io WebSocket for real-time status updates.

**Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

socket.on('statusUpdate', (data) => {
  console.log('Status:', data.status);
  console.log('Message:', data.message);
});
```

**Events:**
- `statusUpdate`: Student status changed (normal → locked → remedial)
- `cheaterDetected`: Suspicious activity flagged

## 🎨 Styling

Uses Tailwind CSS with custom color scheme optimized for the intervention system.

**Color Palette:**
- Primary: Cyan to Blue gradient
- Locked: Amber to Orange (warning)
- Remedial: Purple to Pink
- Success: Green to Emerald

**Responsive Design:**
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🚢 Deployment

### Deploy to Vercel

1. **Connect GitHub repository**
2. **Framework preset**: Vite
3. **Build command**: `pnpm build`
4. **Output directory**: `dist`
5. **Environment variables**:
   - `VITE_API_URL=https://api.example.com`
   - `VITE_SOCKET_URL=https://api.example.com`
6. **Deploy**

### Deploy to Netlify

1. **Connect GitHub repository**
2. **Build command**: `pnpm build`
3. **Publish directory**: `dist`
4. **Environment variables**:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`
5. **Deploy on push**

### Deploy to Static Host

```bash
# Build
pnpm build

# Upload dist folder to your host
# (AWS S3, Google Cloud Storage, Azure, etc.)
```

## 🧪 Testing

### Component Tests

Use Vitest for unit testing:

```bash
pnpm test
```

### Manual Testing Flow

1. **Normal Checkin**
   - Navigate to home page
   - Enter focus time: 75 minutes
   - Enter quiz score: 85
   - Click "Start Focus Timer"
   - Should see success message

2. **Intervention Flow**
   - Enter focus time: 45 minutes (below 60 threshold)
   - Enter quiz score: 50 (below 70 threshold)
   - Should transition to Locked state
   - Verify WebSocket connection shows loading
   - Simulate mentor approval (test endpoint)
   - Should transition to Remedial state
   - Complete task to return to normal

3. **Cheater Detection**
   - Start checkin
   - Switch browser tabs or minimize window
   - Should trigger cheater event
   - Should be flagged in daily log

## 📡 Environment Variables

```env
# API Base URL
VITE_API_URL=http://localhost:3001/api

# WebSocket Server URL
VITE_SOCKET_URL=http://localhost:3001

# Optional: Analytics, Sentry, etc.
VITE_SENTRY_DSN=https://...
```

## 🔒 Security Notes

1. **API Key Protection**: Don't expose sensitive keys in frontend code
2. **CORS**: Ensure API server allows requests from frontend domain
3. **WebSocket Auth**: Consider adding auth tokens for Socket.io
4. **Input Validation**: Validate all user inputs before sending to backend
5. **Rate Limiting**: Implement client-side request throttling

## 🎯 Performance Optimizations

- Code splitting with Vite
- Image optimization
- CSS minification
- Tree shaking unused code
- Lazy loading components

## 🐛 Troubleshooting

### API Connection Fails
- Check `VITE_API_URL` environment variable
- Verify backend server is running
- Check CORS configuration on backend
- Test with `curl` to isolate client vs server issue

### WebSocket Won't Connect
- Check `VITE_SOCKET_URL` is correct
- Verify backend server is running on that port
- Check browser console for connection errors
- Verify firewall/network allows WebSocket connections

### Components Not Updating
- Check React DevTools for state changes
- Verify WebSocket events are firing
- Check browser console for errors
- Test connection with: `socket.emit('test', {})` in console

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear Vite cache
rm -rf dist .vite

# Rebuild
pnpm build
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🎬 Recording Demo Video

Create a Loom video demonstrating the complete flow:

1. **Setup (0:00-0:30)**
   - Show studentId in URL
   - Open browser console to show WebSocket connection

2. **Normal Checkin (0:30-1:30)**
   - Navigate to Home component
   - Fill in focus minutes: 75
   - Fill in quiz score: 85
   - Submit and show success message

3. **Intervention Trigger (1:30-2:30)**
   - New checkin with low values
   - Enter focus: 45 (below threshold)
   - Enter quiz: 60 (below threshold)
   - Show transition to Locked component
   - Demonstrate loading state

4. **Real-time Updates (2:30-3:30)**
   - Open browser DevTools
   - Show WebSocket events in Network tab
   - Demonstrate socket messages
   - Show message updates in real-time

5. **Task Completion (3:30-4:30)**
   - Navigate to Remedial component
   - Show task assignment
   - Click "Mark Task Complete"
   - Show success state
   - Verify status returns to normal

6. **Cheater Detection (4:30-5:00)**
   - During checkin, switch browser tabs
   - Show page visibility API triggering
   - Demonstrate socket event firing

---

**Building interfaces that help students succeed! 🎓**
