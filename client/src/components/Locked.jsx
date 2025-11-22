import { useState, useEffect } from 'react';

export default function Locked() {
  const [dotCount, setDotCount] = useState(0);

  // Animated loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const dots = '.'.repeat(dotCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border-4 border-orange-200">
          
          {/* Animated Hourglass Emoji */}
          <div className="mb-8 flex justify-center">
            <div className="text-8xl animate-bounce">
              ⏳
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl font-bold text-orange-600 mb-6">
            Analysis in progress{dots}
          </h1>

          {/* Friendly Message */}
          <p className="text-2xl text-gray-700 font-medium mb-8 leading-relaxed">
            Your mentor will get back soon! 🌟
          </p>

          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-4 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-5 w-5 rounded-full transition-all duration-500 ${
                  i <= dotCount
                    ? 'bg-gradient-to-br from-orange-400 to-yellow-500 scale-110 shadow-lg'
                    : 'bg-gray-300 scale-75'
                }`}
              />
            ))}
          </div>

          {/* Encouraging Note */}
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-2xl p-6 shadow-inner">
            <p className="text-lg text-gray-800 font-medium">
              💡 <strong>Hang tight!</strong> Your personalized feedback is being prepared.
            </p>
            <p className="text-gray-600 mt-3 text-sm">
              This usually takes just a few minutes. Stay on this page!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
