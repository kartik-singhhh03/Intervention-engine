import { useState } from 'react';
import { completeTask } from '../services/api';

export default function Remedial({ studentId, interventionId, task }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCompleteTask = async () => {
    if (!interventionId) {
      setError('⚠️ No intervention ID found. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await completeTask(studentId, interventionId);
      if (response.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete task. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border-4 border-green-300">
            
            {/* Success Animation */}
            <div className="mb-8 flex justify-center">
              <div className="text-9xl animate-bounce">
                🎉
              </div>
            </div>

            <h1 className="text-5xl font-bold text-green-600 mb-6">
              Awesome Job! ✨
            </h1>
            
            <p className="text-2xl text-gray-700 font-medium mb-8">
              You've completed your task successfully! 🌟
            </p>

            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-2xl p-6 shadow-inner">
              <p className="text-lg text-gray-800">
                <strong>🎊 Great work, Super Learner!</strong> You're all unlocked and ready to continue your learning journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border-4 border-purple-200">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="text-7xl mb-4">📘</div>
            <h1 className="text-5xl font-bold text-purple-600 mb-3">
              Your Mentor Has Given You a Task!
            </h1>
            <p className="text-xl text-gray-600">Complete it to unlock your next session 🔓</p>
          </div>

          {/* Task Content */}
          <div className="mb-10 p-8 bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-purple-300 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
              <span className="mr-3">✏️</span> Your Task
            </h2>
            <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">
              {task || 'Loading your personalized task...'}
            </p>

            {!task && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-10 space-y-4 text-lg text-gray-700">
            <div className="flex items-start space-x-4 bg-white rounded-2xl p-4 border-2 border-purple-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg shadow-md">
                1
              </div>
              <p className="pt-1"><strong>Read</strong> the task carefully and understand what's needed</p>
            </div>
            <div className="flex items-start space-x-4 bg-white rounded-2xl p-4 border-2 border-purple-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg shadow-md">
                2
              </div>
              <p className="pt-1"><strong>Complete</strong> the work your mentor has assigned</p>
            </div>
            <div className="flex items-start space-x-4 bg-white rounded-2xl p-4 border-2 border-purple-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg shadow-md">
                3
              </div>
              <p className="pt-1"><strong>Click</strong> the big button below when you're done! 🎯</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-5 bg-red-100 border-3 border-red-400 rounded-2xl text-red-700 text-lg font-medium shadow-sm">
              {error}
            </div>
          )}

          {/* Complete Button */}
          <button
            onClick={handleCompleteTask}
            disabled={loading || !task}
            className="w-full py-6 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white text-2xl font-bold rounded-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl hover:scale-105 transform"
          >
            {loading ? '⏳ Marking Complete...' : '✓ Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
