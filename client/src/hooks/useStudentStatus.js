import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useStudentStatus = (studentId) => {
  const [status, setStatus] = useState('normal');
  const [message, setMessage] = useState('');
  const [currentTask, setCurrentTask] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!studentId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket');
      socketRef.current.emit('userSubscribe', studentId);
    });

    socketRef.current.on('statusUpdate', (data) => {
      console.log('Status update received:', data);
      setStatus(data.status);
      setMessage(data.message);
      if (data.task) {
        setCurrentTask(data.task);
      }
    });

    socketRef.current.on('cheaterDetected', (data) => {
      console.log('Cheater detected:', data);
      setStatus('locked');
      setMessage(data.message);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [studentId]);

  const emitStatusUpdate = (newStatus, newMessage) => {
    if (socketRef.current) {
      socketRef.current.emit('statusUpdate', {
        studentId,
        status: newStatus,
        message: newMessage,
      });
    }
  };

  const emitCheater = () => {
    if (socketRef.current) {
      socketRef.current.emit('cheater', { studentId });
    }
  };

  return {
    status,
    message,
    currentTask,
    emitStatusUpdate,
    emitCheater,
    socket: socketRef.current,
  };
};
