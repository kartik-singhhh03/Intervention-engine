import { useState } from 'react';
import { submitDailyCheckin } from '../services/api';
import { getVisibilityEventCount, getCheaterDetected } from '../utils/cheaterDetection';

export default function Normal({ studentId, socket }) {
  const [focusMinutes, setFocusMinutes] = useState('');
  const [quizScore, setQuizScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmitCheckin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const pageVisibilityEvents = getVisibilityEventCount();
      const cheaterDetected = getCheaterDetected();
      
      const response = await submitDailyCheckin(
        studentId,
        parseInt(focusMinutes) || 0,
        parseInt(quizScore) || 0,
        pageVisibilityEvents,
        cheaterDetected
      );

      console.log('✅ Check-in submitted:', response);
      
      // Reset form on success
      setFocusMinutes('');
      setQuizScore('');
      setSuccess(true);
      
      // WebSocket will handle state transition
    } catch (err) {
      console.error('❌ Check-in failed:', err);
      setError(err.message || 'Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              👋 Hey Super Learner!
            </h1>
            <p className="text-gray-600 text-lg font-medium">Let's track your amazing progress today! 🌟</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border-2 border-green-400 rounded-2xl text-green-700 text-center animate-bounce">
              <span className="text-2xl">🎉</span> <strong>Awesome!</strong> Check-in submitted!
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitCheckin} className="space-y-6">
            {/* Focus Timer Input */}
            <div>
              <label htmlFor="focus" className="flex items-center text-lg font-bold text-gray-700 mb-3">
                <span className="text-2xl mr-2">⏰</span> Focus Minutes Today
              </label>
              <input
                id="focus"
                type="number"
                value={focusMinutes}
                onChange={(e) => setFocusMinutes(e.target.value)}
                placeholder="How many minutes?"
                className="w-full px-5 py-4 rounded-2xl border-3 border-purple-300 text-gray-800 text-lg font-semibold placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all shadow-md"
                required
                min="0"
                max="1440"
              />
            </div>

            {/* Quiz Score Input */}
            <div>
              <label htmlFor="quiz" className="flex items-center text-lg font-bold text-gray-700 mb-3">
                <span className="text-2xl mr-2">📝</span> Daily Quiz Score (0-10)
              </label>
              <input
                id="quiz"
                type="number"
                value={quizScore}
                onChange={(e) => setQuizScore(e.target.value)}
                placeholder="Your score out of 10"
                className="w-full px-5 py-4 rounded-2xl border-3 border-pink-300 text-gray-800 text-lg font-semibold placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-200 transition-all shadow-md"
                required
                min="0"
                max="10"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-700 text-center font-semibold">
                <span className="text-2xl">😞</span> {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white text-xl font-bold rounded-3xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span>🚀 Submit Check-In!</span>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <p className="text-sm text-gray-500 text-center font-medium">
              💡 Keep up the great work! We're here to help you succeed! 🌈
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
