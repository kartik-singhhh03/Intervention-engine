import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

export default function Locked() {
  const [dotCount, setDotCount] = useState(0);
  const hourglassRef = useRef(null);
  const containerRef = useRef(null);

  // Animated loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // GSAP hourglass flip animation
  useEffect(() => {
    if (hourglassRef.current) {
      gsap.to(hourglassRef.current, {
        rotation: 180,
        duration: 2,
        repeat: -1,
        repeatDelay: 1,
        ease: 'power2.inOut',
      });
    }

    // Pulsing glow effect
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        boxShadow: '0 0 60px rgba(255, 165, 0, 0.6)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, []);

  const dots = '.'.repeat(dotCount);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex items-center justify-center p-6">
      {/* Animated Background Waves */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-full h-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="w-full max-w-lg relative z-10"
      >
        <div
          ref={containerRef}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border-2 border-orange-400/50"
        >
          {/* Animated Hourglass Emoji */}
          <div className="mb-8 flex justify-center">
            <motion.div
              ref={hourglassRef}
              className="text-9xl"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              ⏳
            </motion.div>
          </div>

          {/* Main Message */}
          <motion.h1
            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300 mb-6"
            animate={{
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            Analysis in progress{dots}
          </motion.h1>

          {/* Friendly Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-white/90 font-medium mb-8 leading-relaxed"
          >
            Your mentor will get back soon! 🌟
          </motion.p>

          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-4 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{
                  scale: i <= dotCount ? [1, 1.3, 1] : 0.7,
                  backgroundColor:
                    i <= dotCount
                      ? ['#f97316', '#fbbf24', '#f97316']
                      : '#94a3b8',
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                className="h-6 w-6 rounded-full shadow-lg"
              />
            ))}
          </div>

          {/* Encouraging Note */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border-2 border-orange-400/50 rounded-2xl p-6 shadow-lg"
          >
            <p className="text-lg text-white font-medium">
              💡 <strong>Hang tight!</strong> Your personalized feedback is being
              prepared.
            </p>
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/70 mt-3 text-sm"
            >
              This usually takes just a few minutes. Stay on this page!
            </motion.p>
          </motion.div>

          {/* Rotating Border Effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg, transparent, orange, transparent)',
              opacity: 0.3,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
