import express from 'express';
import { query } from '../db.js';
import { emitStatus } from '../ws.js';

const router = express.Router();

/**
 * Assigns an intervention to a student
 * @route POST /api/interventions/assign
 * @param {Object} req.body - Request body
 * @param {number} req.body.studentId - Student ID
 * @param {string} req.body.task - Task description
 * @param {string} [req.body.mentorNotes] - Optional mentor notes
 */
router.post('/', async (req, res) => {
  const { studentId, task, mentorNotes } = req.body;

  // Input validation
  if (!studentId || !task) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'studentId and task are required'
    });
  }

  if (typeof task !== 'string' || task.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid task',
      details: 'task must be a non-empty string'
    });
  }

  try {
    // Check if student exists
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

    // Insert intervention record
    const interventionResult = await query(
      `INSERT INTO interventions (student_id, task, mentor_notes, status)
       VALUES ($1, $2, $3, 'assigned')
       RETURNING id, assigned_at`,
      [studentId, task.trim(), mentorNotes?.trim() || null]
    );

    const interventionId = interventionResult.rows[0].id;
    const assignedAt = interventionResult.rows[0].assigned_at;

    // Update student status and current task
    await query(
      `UPDATE students 
       SET status = 'remedial', 
           current_task = $1, 
           updated_at = NOW()
       WHERE student_id = $2`,
      [task.trim(), studentId]
    );

    // Prepare response data
    const responseData = {
      interventionId,
      studentId,
      task: task.trim(),
      status: 'remedial',
      assignedAt
    };

    // Emit WebSocket event to student using emitStatus helper
    const io = req.app.locals.io;
    emitStatus(io, studentId, {
      type: 'intervention_assigned',
      status: 'remedial',
      currentTask: task.trim(),
      interventionId,
      assignedAt,
      mentorNotes: mentorNotes?.trim() || null
    });

    // Return success response
    return res.status(201).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error assigning intervention:', error);

    // Handle specific database errors
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Foreign key constraint failed',
        details: 'Invalid studentId reference'
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Duplicate entry',
        details: 'An intervention may already be assigned'
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Failed to assign intervention',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;