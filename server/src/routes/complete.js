import express from 'express';
import { query } from '../db.js';
import { emitStatus } from '../ws.js';

const router = express.Router();

/**
 * Marks an intervention as completed and updates student status
 * @route POST /api/interventions/complete
 * @param {Object} req.body - Request body
 * @param {number} req.body.studentId - Student ID
 * @param {number} req.body.interventionId - Intervention ID
 */
router.post('/', async (req, res) => {
  const { studentId, interventionId } = req.body;

  // Input validation
  if (!studentId || !interventionId) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'studentId and interventionId are required'
    });
  }

  try {
    // Verify student exists
    const studentResult = await query(
      'SELECT id, status FROM students WHERE student_id = $1',
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Student not found',
        details: `No student found with student_id ${studentId}`
      });
    }

    // Verify intervention exists and belongs to this student
    const interventionResult = await query(
      'SELECT id, student_id, status FROM interventions WHERE id = $1 AND student_id = $2',
      [interventionId, studentId]
    );

    if (interventionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Intervention not found',
        details: `No intervention found with id ${interventionId} for student ${studentId}`
      });
    }

    const intervention = interventionResult.rows[0];

    // Check if already completed
    if (intervention.status === 'completed') {
      return res.status(400).json({
        error: 'Intervention already completed',
        details: 'This intervention has already been marked as completed'
      });
    }

    const completedAt = new Date();

    // Update intervention status to completed
    await query(
      `UPDATE interventions 
       SET status = 'completed', 
           completed_at = $1, 
           updated_at = NOW()
       WHERE id = $2`,
      [completedAt, interventionId]
    );

    const unlockedAt = new Date();

    // Update student status back to on_track
    await query(
      `UPDATE students 
       SET status = 'on_track', 
           current_task = NULL, 
           unlocked_at = $1,
           updated_at = NOW()
       WHERE student_id = $2`,
      [unlockedAt, studentId]
    );

    const completedAtISO = completedAt.toISOString();
    const unlockedAtISO = unlockedAt.toISOString();

    // Emit WebSocket event to student using emitStatus helper
    const io = req.app.locals.io;
    emitStatus(io, studentId, {
      type: 'task_completed',
      status: 'on_track',
      currentTask: null,
      interventionId,
      completedAt: completedAtISO,
      unlockedAt: unlockedAtISO
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        studentId,
        interventionId,
        status: 'on_track',
        completedAt: completedAtISO,
        unlockedAt: unlockedAtISO
      }
    });

  } catch (error) {
    console.error('❌ Error completing task:', error);

    // Handle specific PostgreSQL errors
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Foreign key constraint failed',
        details: 'Invalid reference in database'
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Failed to complete task',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
