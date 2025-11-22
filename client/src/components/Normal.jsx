import { useState } from 'react';
import { submitDailyCheckin } from '../services/api';
import { getVisibilityEventCount, getCheaterDetected } from '../utils/cheaterDetection';

const floatingDecor = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  top: (i * 12 + 5) % 90,
  left: (i * 17 + 8) % 90,
}));

export default function Normal({ studentId }) {
  const [focusMinutes, setFocusMinutes] = useState('');
  const [quizScore, setQuizScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const pageVisibilityEvents = getVisibilityEventCount();
      const cheaterDetected = getCheaterDetected();

      await submitDailyCheckin(
        studentId,
        parseInt(focusMinutes, 10) || 0,
        parseInt(quizScore, 10) || 0,
        pageVisibilityEvents,
        cheaterDetected
      );

      setFocusMinutes('');
      setQuizScore('');
      setSuccessMessage('Great job! Your check-in has been submitted.');
    } catch (error) {
      console.error('❌ Check-in failed:', error);
      setErrorMessage(error.message || 'Unable to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-indigo-400 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        {floatingDecor.map((item) => (
          <span
            key={`cloud-${item.id}`}
            style={{ top: `${item.top}%`, left: `${item.left}%` }}
            className="absolute text-5xl opacity-70 animate-pulse"
          >
            ☁️
          </span>
        ))}
        {floatingDecor.map((item) => (
          <span
            key={`star-${item.id}`}
            style={{
              top: `${(item.top + 8) % 90}%`,
              left: `${(item.left + 12) % 90}%`,
            }}
            className="absolute text-yellow-200 text-2xl animate-bounce"
          >
            ✨
          </span>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/70 px-6 py-8 md:p-10">
          <div className="text-center mb-8">
            <p className="text-5xl">🎓</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mt-4">
              Hey Super Learner!
            </h1>
            <p className="text-gray-600 text-lg md:text-xl mt-3">
              Tell us about today’s focus time and quiz score.
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800 px-4 py-5 font-semibold text-center">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 text-red-700 px-4 py-5 font-semibold text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="focus" className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
                <span className="text-3xl">⏰</span>
                <span>How many minutes did you study?</span>
              </label>
              <input
                id="focus"
                type="number"
                value={focusMinutes}
                onChange={(event) => setFocusMinutes(event.target.value)}
                placeholder="e.g. 75"
                className="mt-3 w-full rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4 text-2xl font-bold text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200"
                required
                min="0"
                max="1440"
                autoComplete="off"
              />
              <p className="text-gray-500 mt-2 text-sm">💡 Aim for at least 60 minutes to stay on track.</p>
            </div>

            <div>
              <label htmlFor="quiz" className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
                <span className="text-3xl">📝</span>
                <span>What’s your quiz score (0-10)?</span>
              </label>
              <input
                id="quiz"
                type="number"
                value={quizScore}
                onChange={(event) => setQuizScore(event.target.value)}
                placeholder="e.g. 9"
                className="mt-3 w-full rounded-2xl border border-pink-200 bg-pink-50 px-5 py-4 text-2xl font-bold text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-200"
                required
                min="0"
                max="10"
                autoComplete="off"
              />
              <p className="text-gray-500 mt-2 text-sm">⭐ Scores above 7 keep you in the clear.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-8 py-5 text-2xl font-black text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting…' : 'Submit My Progress'}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-600 font-semibold">
            Keep up the amazing work! 🌈
          </div>
        </div>
      </div>
    </div>
  );
}
