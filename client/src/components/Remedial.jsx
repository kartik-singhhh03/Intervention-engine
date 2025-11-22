import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { completeTask } from '../services/api';

export default function Remedial({ studentId, interventionId, task }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const confettiRef = useRef([]);
  const taskBoxRef = useRef(null);

  useEffect(() => {
    // Task box entrance animation
    if (taskBoxRef.current) {
      gsap.fromTo(
        taskBoxRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1, ease: 'back.out(1.7)' }
      );
    }
  }, [task]);

  // Success confetti animation
  useEffect(() => {
    if (success) {
      confettiRef.current.forEach((confetti, i) => {
        if (confetti) {
          gsap.fromTo(
            confetti,
            { y: -100, opacity: 1, rotation: 0 },
            {
              y: window.innerHeight,
              opacity: 0,
              rotation: 720,
              duration: 2 + Math.random() * 2,
              delay: i * 0.1,
              ease: 'power2.in',
            }
          );
        }
      });
    }
  }, [success]);

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
      
      // Error shake animation
      if (taskBoxRef.current) {
        gsap.fromTo(
          taskBoxRef.current,
          { x: -10 },
          { x: 10, duration: 0.1, repeat: 5, yoyo: true }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 flex items-center justify-center p-6">
        {/* Confetti elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              ref={(el) => (confettiRef.current[i] = el)}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                backgroundColor: ['#10b981', '#fbbf24', '#ec4899', '#3b82f6'][
                  Math.floor(Math.random() * 4)
                ],
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10 }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border-4 border-green-400/50">
            {/* Success Animation */}
            <div className="mb-8 flex justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="text-9xl"
              >
                🎉
              </motion.div>
            </div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 mb-6"
            >
              Awesome Job! ✨
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl text-white/90 font-medium mb-8"
            >
              You've completed your task successfully! 🌟
            </motion.p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-400/50 rounded-2xl p-6 shadow-lg"
            >
              <p className="text-lg text-white">
                <strong>🎊 Great work, Super Learner!</strong> You're all unlocked
                and ready to continue your learning journey.
              </p>
            </motion.div>

            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 150,
                  y: Math.sin((i * Math.PI * 2) / 8) * 150,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center p-6">
      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border-2 border-purple-400/50">
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              📘
            </motion.div>
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-3"
            >
              Your Mentor Has Given You a Task!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-white/80"
            >
              Complete it to unlock your next session 🔓
            </motion.p>
          </div>

          {/* Task Content */}
          <motion.div
            ref={taskBoxRef}
            initial={{ scale: 0 }}
            className="mb-10 p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-4 border-purple-400/50 rounded-3xl shadow-lg relative overflow-hidden"
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center relative z-10">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mr-3 inline-block"
              >
                ✏️
              </motion.span>
              Your Task
            </h2>
            <p className="text-xl text-white leading-relaxed whitespace-pre-wrap relative z-10">
              {task || 'Loading your personalized task...'}
            </p>

            {!task && (
              <div className="flex items-center justify-center py-6 relative z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"
                />
              </div>
            )}
          </motion.div>

          {/* Instructions */}
          <div className="mb-10 space-y-4 text-lg text-gray-700">
            {[
              { icon: '1', text: 'Read the task carefully and understand what\'s needed' },
              { icon: '2', text: 'Complete the work your mentor has assigned' },
              { icon: '3', text: 'Click the big button below when you\'re done! 🎯' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-400/30 shadow-sm"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg shadow-md"
                >
                  {step.icon}
                </motion.div>
                <p className="pt-1 text-white/90">
                  <strong>{step.text.split(' ')[0]}</strong> {step.text.split(' ').slice(1).join(' ')}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="mb-6 p-5 bg-red-500/20 border-3 border-red-400 rounded-2xl text-red-300 text-lg font-medium shadow-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Complete Button */}
          <motion.button
            onClick={handleCompleteTask}
            disabled={loading || !task}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-6 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white text-2xl font-bold rounded-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3"
                  />
                  Marking Complete...
                </span>
              ) : (
                '✓ Mark Complete'
              )}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
