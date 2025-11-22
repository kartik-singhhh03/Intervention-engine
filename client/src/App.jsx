import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Normal from './components/Normal';
import Locked from './components/Locked';
import Remedial from './components/Remedial';
import { getStudentData } from './services/api';
import { startCheaterDetection, stopCheaterDetection } from './utils/cheaterDetection';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

// Get studentId from URL params or use default for testing
const getStudentId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('studentId') || 'alice-2024';
};

export default function App() {
  const studentId = getStudentId();
  const [socket, setSocket] = useState(null);
  const [studentData, setStudentData] = useState({
    status: 'on_track',
    currentTask: null,
    message: '',
    latestIntervention: null
  });
  const [loading, setLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      // Subscribe to student's room
      socketInstance.emit('subscribe', { student_id: studentId });
    });

    socketInstance.on('subscribed', (data) => {
      console.log('📡 Subscribed to room:', data.room);
    });

    // Listen for status updates from backend
    socketInstance.on('status', (payload) => {
      console.log('📥 Status update received:', payload);
      setStudentData(prev => ({
        ...prev,
        status: payload.status || prev.status,
        message: payload.message || '',
        currentTask: payload.currentTask || payload.task || prev.currentTask
      }));
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [studentId]);

  // Load initial student data from backend
  useEffect(() => {
    let isMounted = true;
    
    // Set timeout to force loading to false after 2 seconds
    const timeoutId = setTimeout(() => {
      console.log('⏱️ Loading timeout - forcing app to show');
      if (isMounted) {
        setLoading(false);
      }
    }, 2000);

    const loadStudentData = async () => {
      try {
        console.log('🔄 Loading student data for:', studentId);
        const data = await getStudentData(studentId);
        console.log('📊 Student data loaded:', data);
        
        if (isMounted) {
          setStudentData({
            status: data.data?.status || 'on_track',
            currentTask: data.data?.currentTask || null,
            message: '',
            latestIntervention: data.data?.latestIntervention || null
          });
        }
      } catch (error) {
        console.error('❌ Failed to load student data:', error);
        // Default to on_track if API fails
        if (isMounted) {
          setStudentData({
            status: 'on_track',
            currentTask: null,
            message: '',
            latestIntervention: null
          });
        }
      } finally {
        console.log('✅ Loading complete, setting loading to false');
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudentData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [studentId]);

  // Setup cheater detection
  useEffect(() => {
    if (socket && studentId) {
      startCheaterDetection(socket, studentId);

      return () => {
        stopCheaterDetection();
      };
    }
  }, [socket, studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // Route based on student status
  const { status, currentTask, message, latestIntervention } = studentData;

  if (status === 'needs_intervention') {
    return <Locked studentId={studentId} message={message} />;
  }

  if (status === 'remedial') {
    return (
      <Remedial
        studentId={studentId}
        task={currentTask}
        interventionId={latestIntervention?.id}
      />
    );
  }

  // Default: on_track
  return <Normal studentId={studentId} socket={socket} />;
}
