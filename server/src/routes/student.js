import express from 'express';
import { query } from '../db.js';

const router = express.Router();

/**
 * Get student status and latest intervention
 * @route GET /api/student/:studentId
 * @param {number} req.params.studentId - Student ID
 */
router.get('/:studentId', async (req, res) => {
  const { studentId } = req.params;

  // Input validation - accept both string and numeric IDs
  if (!studentId || studentId.trim() === '') {
    return res.status(400).json({
      error: 'Invalid studentId',
      details: 'studentId is required'
    });
  }

  try {
    // Fetch student data with latest intervention using LEFT JOIN
    const result = await query(
      `SELECT 
        s.student_id AS "studentId",
        s.status,
        s.current_task AS "currentTask",
        s.last_checkin_at AS "lastCheckinAt",
        s.locked_at AS "lockedAt",
        s.unlocked_at AS "unlockedAt",
        i.id AS "interventionId",
        i.task AS "interventionTask",
        i.mentor_notes AS "interventionMentorNotes",
        i.status AS "interventionStatus",
        i.created_at AS "interventionCreatedAt",
        i.completed_at AS "interventionCompletedAt"
      FROM students s
      LEFT JOIN interventions i ON s.student_id = i.student_id
        AND i.id = (
          SELECT id 
          FROM interventions 
          WHERE student_id = s.student_id 
          ORDER BY created_at DESC 
          LIMIT 1
        )
      WHERE s.student_id = $1`,
      [studentId]
    );

    // Check if student exists
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Student not found',
        details: `No student found with student_id ${studentId}`
      });
    }

    const row = result.rows[0];

    // Build response object
    const response = {
      studentId: row.studentId,
      status: row.status,
      currentTask: row.currentTask,
      lastCheckinAt: row.lastCheckinAt,
      lockedAt: row.lockedAt,
      unlockedAt: row.unlockedAt,
      latestIntervention: null
    };

    // Add latest intervention if it exists
    if (row.interventionId) {
      response.latestIntervention = {
        id: row.interventionId,
        task: row.interventionTask,
        mentorNotes: row.interventionMentorNotes,
        status: row.interventionStatus,
        createdAt: row.interventionCreatedAt,
        completedAt: row.interventionCompletedAt
      };
    }

    return res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching student:', error);

    // Handle specific database errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Database connection failed',
        details: 'Unable to connect to database'
      });
    }

    if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      return res.status(503).json({
        error: 'Database lock timeout',
        details: 'Please try again in a moment'
      });
    }

    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        error: 'Database schema error',
        details: 'Invalid field reference in query'
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Failed to fetch student data',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });

  }
});

export default router;
