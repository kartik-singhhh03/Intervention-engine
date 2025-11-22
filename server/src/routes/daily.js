import express from 'express';
import { query } from "../db.js";
import { sendWebhook } from "../utils/sendWebhook.js";
import { emitStatus } from '../ws.js';

const router = express.Router();

/**
 * POST /api/daily/checkin
 * Handles:
 *  - Focus minutes
 *  - Quiz score
 *  - Cheater detection
 *  - Real-time WS update
 *  - n8n webhook trigger
 *  - Student state updates
 */
router.post('/checkin', async (req, res) => {
  try {
    const io = req.app.locals.io;

    const {
      studentId,
      focusMinutes = 0,
      quizScore = 0,
      pageVisibilityEvents = 0,
      cheaterDetected = false,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    // Assignment RULE:
    // Success => quizScore > 7 AND focusMinutes > 60
    const quizThreshold = 7;
    const focusThreshold = 60;

    const isSuccess =
      Number(quizScore) > quizThreshold &&
      Number(focusMinutes) > focusThreshold &&
      !cheaterDetected;

    const needsIntervention = !isSuccess;

    // --------------------------------------------------------
    // Insert DAILY LOG ENTRY
    // --------------------------------------------------------

    const logResult = await query(
      `
      INSERT INTO daily_logs
      (student_id, focus_minutes, quiz_score, page_visibility_events, cheater_detected, is_success)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        studentId,
        focusMinutes,
        quizScore,
        pageVisibilityEvents,
        cheaterDetected,
        isSuccess,
      ]
    );

    const logId = logResult.rows[0].id;

    // --------------------------------------------------------
    // SUCCESS → student stays ON TRACK
    // --------------------------------------------------------

    if (isSuccess) {
      await query(
        `
        UPDATE students
        SET status = 'on_track',
            current_task = NULL,
            updated_at = NOW(),
            last_checkin_at = NOW()
        WHERE student_id = $1
      `,
        [studentId]
      );

      // Emit real-time update using emitStatus helper
      emitStatus(io, studentId, {
        status: "on_track",
        message: "Great job! You're on track.",
        logId,
      });

      return res.json({
        status: "on_track",
        message: "Check-in successful",
        logId,
      });
    }

    // --------------------------------------------------------
    // FAILURE → NEEDS INTERVENTION (LOCKED STATE)
    // --------------------------------------------------------

    await query(
      `
      UPDATE students
      SET status = 'needs_intervention',
          updated_at = NOW(),
          locked_at = NOW()
      WHERE student_id = $1
      `,
      [studentId]
    );

    // Fire n8n webhook
    const webhookUrl = process.env.N8N_FAILURE_WEBHOOK_URL;
    if (webhookUrl) {
      await sendWebhook(webhookUrl, {
        student_id: studentId,
        focus_minutes: focusMinutes,
        quiz_score: quizScore,
        cheater_detected: cheaterDetected,
        reason: determineFailureReason(
          focusMinutes,
          quizScore,
          cheaterDetected,
          focusThreshold,
          quizThreshold
        ),
        log_id: logId,
      });
    }

    // Emit via WebSockets using emitStatus helper
    emitStatus(io, studentId, {
      status: "needs_intervention",
      message: "Analysis in progress. Waiting for mentor...",
      logId,
    });

    return res.json({
      status: "needs_intervention",
      message: "Analysis in progress. Waiting for mentor...",
      logId,
    });
  } catch (error) {
    console.error("❌ Daily check-in error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------------------------------------------
// Determine WHY failure happened
// Used in the n8n webhook for mentor context
// --------------------------------------------------------

const determineFailureReason = (
  focusMinutes,
  quizScore,
  cheaterDetected,
  focusThreshold,
  quizThreshold
) => {
  const reasons = [];

  if (focusMinutes < focusThreshold) {
    reasons.push(
      `Low focus time: ${focusMinutes} minutes (needed > ${focusThreshold})`
    );
  }

  if (quizScore <= quizThreshold) {
    reasons.push(`Low quiz score: ${quizScore} (needed > ${quizThreshold})`);
  }

  if (cheaterDetected) {
    reasons.push("Cheater detection triggered (tab switch / hidden window)");
  }

  return reasons.join("; ");
};

export default router;
