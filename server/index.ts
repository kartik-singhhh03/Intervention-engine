// server/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { dailyCheckinRouter } from "./routes/daily-checkin";
import { interventionRouter } from "./routes/intervention";
import { studentRouter } from "./routes/student";
import { registerCheaterEvents } from "./sockets/cheater";
import { registerStudentRoomEvents } from "./sockets/student-room";

// Create & configure server
export function createServer() {
  const app = express();

  // ----------------------------
  // Middleware
  // ----------------------------
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ----------------------------
  // Health Check + Utility Routes
  // ----------------------------
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      environment: process.env.NODE_ENV ?? "development",
    });
  });

  // ----------------------------
  // Assignment Feature Routes
  // ----------------------------

  /**
   * /api/daily-checkin
   * - Accepts quiz_score & focus_minutes
   * - Determines student “state”
   * - If failure → triggers n8n
   * - Emits real-time WS events
   */
  app.use("/api", dailyCheckinRouter);

  /**
   * /api/assign-intervention
   * /api/complete-task
   * - Called by Mentor → n8n → Backend
   * - Updates student state to “remedial” or “on_track”
   * - Emits socket events to update client UI instantly
   */
  app.use("/api", interventionRouter);

  /**
   * /api/student/:studentId
   * Used by frontend to fetch:
   * - Student profile
   * - Current status
   * - Remedial task
   */
  app.use("/api", studentRouter);

  // ----------------------------
  // HTTP server + Socket.IO setup
  // ----------------------------

  const server = http.createServer(app);

  const io = new SocketServer(server, {
    cors: {
      origin: "*",
    },
  });

  // Make io available to routes via app.locals
  app.locals.io = io;

  // ----------------------------
  // WebSocket: Core Events
  // ----------------------------

  io.on("connection", (socket) => {
    console.log("[WS] User connected:", socket.id);

    // Student joins room → “student_<id>”
    registerStudentRoomEvents(socket);

    // Cheater detection events (from React client)
    registerCheaterEvents(socket);

    socket.on("disconnect", () => {
      console.log("[WS] User disconnected:", socket.id);
    });
  });

  // ----------------------------
  // Server Start
  // ----------------------------

  const port = Number(process.env.PORT) || 4000;
  server.listen(port, () => {
    console.log(`🚀 Alcovia server running on port ${port}`);
    console.log(`🟢 WebSockets active`);
  });

  return server;
}
