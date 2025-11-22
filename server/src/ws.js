// server/src/ws.js
import { Server } from "socket.io";
import { logCheaterEvent } from './utils/logCheaterEvent.js';

/**
 * Initializes Socket.IO with correct namespaces, rooms, and event handlers.
 * This powers:
 *  - Real-Time Magic (instant state updates)
 *  - Tab-switch / focus cheating detection
 *  - Student room broadcasts (student_<id>)
 */
export const setupWebSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);

    // ----------------------------------------------------
    // 1. Student subscribes to their room
    // ----------------------------------------------------
    socket.on("subscribe", ({ student_id }) => {
      if (!student_id) {
        console.warn(`⚠️ Subscribe event received without student_id from socket ${socket.id}`);
        return;
      }

      // Validate student_id is a number
      const studentId = typeof student_id === 'number' ? student_id : parseInt(student_id, 10);
      
      if (isNaN(studentId) || studentId <= 0) {
        console.error(`❌ Invalid student_id received: ${student_id}`);
        return;
      }

      const room = `student_${studentId}`;
      socket.join(room);

      console.log(`📡 Student ${studentId} joined room: ${room} (socket: ${socket.id})`);

      // Acknowledge subscription
      socket.emit("subscribed", {
        room,
        studentId,
        message: "Subscribed to real-time updates",
        timestamp: new Date().toISOString()
      });
    });

    // ----------------------------------------------------
    // 2. Cheater detection events (tab switch / hidden window)
    // ----------------------------------------------------
    socket.on("cheater", async ({ student_id, reason }) => {
      if (!student_id) {
        console.warn(`⚠️ Cheater event received without student_id from socket ${socket.id}`);
        return;
      }

      // Validate and parse student_id
      const studentId = typeof student_id === 'number' ? student_id : parseInt(student_id, 10);
      
      if (isNaN(studentId) || studentId <= 0) {
        console.error(`❌ Invalid student_id in cheater event: ${student_id}`);
        return;
      }

      const cheaterReason = reason || 'unknown';
      
      console.log(`🚨 Cheater event from student ${studentId}: ${cheaterReason}`);

      // Log cheater event to database
      try {
        await logCheaterEvent(studentId, cheaterReason);
      } catch (error) {
        console.error(`❌ Failed to log cheater event for student ${studentId}:`, error);
      }

      // Broadcast to all connected clients (dashboards, monitoring tools)
      io.emit("cheater_event", {
        student_id: studentId,
        reason: cheaterReason,
        timestamp: new Date().toISOString(),
        socketId: socket.id
      });

      console.log(`📡 Broadcast cheater_event for student ${studentId} to all clients`);
    });

    // ----------------------------------------------------
    // 3. General status broadcast handler
    // ----------------------------------------------------
    socket.on("status", ({ student_id, status, task, message, ...extraData }) => {
      if (!student_id) {
        console.warn(`⚠️ Status event received without student_id from socket ${socket.id}`);
        return;
      }

      // Validate student_id
      const studentId = typeof student_id === 'number' ? student_id : parseInt(student_id, 10);
      
      if (isNaN(studentId) || studentId <= 0) {
        console.error(`❌ Invalid student_id in status event: ${student_id}`);
        return;
      }

      const room = `student_${studentId}`;
      const statusPayload = {
        status: status || 'unknown',
        task: task ?? null,
        message: message ?? "Status updated",
        ...extraData,
        timestamp: new Date().toISOString()
      };

      io.to(room).emit("status", statusPayload);

      console.log(`📡 Status broadcast to ${room}:`, { status: statusPayload.status, message: statusPayload.message });
    });

    // ----------------------------------------------------
    // 4. Cleanup when client disconnects
    // ----------------------------------------------------
    socket.on("disconnect", () => {
      console.log(`❌ WebSocket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Helper for backend routes to emit status updates.
 * Used by:
 *  - daily-checkin
 *  - assign-intervention
 *  - complete-task
 *  - auto unlock / fail-safe
 * @param {Object} io - Socket.IO server instance
 * @param {number|string} studentId - Student ID to send status to
 * @param {Object} payload - Status payload to emit
 */
export const emitStatus = (io, studentId, payload) => {
  if (!io) {
    console.error('❌ emitStatus: io instance is null or undefined');
    return;
  }

  // Parse studentId if it's a string
  const parsedStudentId = typeof studentId === 'number' ? studentId : parseInt(studentId, 10);
  
  if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
    console.error(`❌ emitStatus: Invalid studentId: ${studentId}`);
    return;
  }

  const room = `student_${parsedStudentId}`;
  const statusPayload = {
    ...payload,
    timestamp: new Date().toISOString()
  };

  io.to(room).emit("status", statusPayload);
  
  console.log(`📡 Emitted status → ${room}:`, { 
    status: statusPayload.status, 
    message: statusPayload.message || 'N/A' 
  });
};
