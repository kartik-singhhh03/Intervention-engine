import { query } from '../db.js';

/**
 * Logs a cheater detection event for a student
 * Updates the latest daily_logs entry with cheater detection information
 * @param {number} studentId - The ID of the student who triggered the cheater detection
 * @param {string} reason - The reason for flagging the student (e.g., 'tab_switch', 'page_blur')
 * @returns {Promise<Object>} Result object with success status
 */
export const logCheaterEvent = async (studentId, reason = 'unknown') => {
  // Input validation
  if (!studentId || typeof studentId !== 'number' || studentId <= 0) {
    console.error('❌ logCheaterEvent: Invalid studentId provided');
    return { success: false, error: 'Invalid studentId' };
  }

  try {
    // Update the latest log entry using subquery (as per spec)
    // This increments page_visibility_events and sets cheater_detected=true
    const result = await query(
      `UPDATE daily_logs 
       SET 
         page_visibility_events = page_visibility_events + 1,
         cheater_detected = true,
         updated_at = NOW()
       WHERE id = (
         SELECT id 
         FROM daily_logs 
         WHERE student_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1
       )`,
      [studentId]
    );

    if (result.rowCount === 0) {
      console.warn(`⚠️ No daily_logs entry found for student ${studentId}. Cannot log cheater event.`);
      return { 
        success: false, 
        error: 'No daily_logs entry found',
        studentId 
      };
    }

    console.log(`🚨 Cheater event logged for student ${studentId} (reason: ${reason})`);

    return {
      success: true,
      studentId,
      reason,
      message: 'Cheater event logged successfully'
    };

  } catch (error) {
    // Log the error but don't throw - this is a non-critical background operation
    console.error('❌ Error logging cheater event:', {
      studentId,
      reason,
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    return {
      success: false,
      error: error.message,
      studentId,
      reason
    };
  }
};

/**
 * Logs multiple cheater events in batch
 * Useful for processing multiple violations at once
 * @param {Array<{studentId: number, reason: string}>} events - Array of events to log
 * @returns {Promise<Object>} Summary of batch operation
 */
export const logCheaterEventsBatch = async (events) => {
  if (!Array.isArray(events) || events.length === 0) {
    console.error('❌ logCheaterEventsBatch: Invalid events array');
    return { success: false, error: 'Invalid events array' };
  }

  const results = await Promise.allSettled(
    events.map(event => logCheaterEvent(event.studentId, event.reason))
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;

  console.log(`📊 Batch cheater logging complete: ${successful} successful, ${failed} failed`);

  return {
    success: true,
    total: results.length,
    successful,
    failed,
    results
  };
};
