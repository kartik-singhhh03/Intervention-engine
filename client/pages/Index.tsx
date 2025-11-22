import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-xl font-bold">Alcovia</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button className="text-slate-300 hover:text-white transition">Features</button>
            <button className="text-slate-300 hover:text-white transition">About</button>
            <button className="text-slate-300 hover:text-white transition">Contact</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Intelligent Student
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Intervention Engine
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Real-time monitoring and personalized interventions to help students stay focused, achieve their goals, and reach their full potential.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/?studentId=demo-student"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition duration-200 shadow-lg hover:shadow-xl inline-block"
            >
              Start Daily Checkin
            </Link>
            <button className="px-8 py-4 border border-white/30 hover:border-white/50 rounded-lg font-semibold text-lg transition duration-200 hover:bg-white/5">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16">
            <div>
              <div className="text-3xl font-bold text-cyan-400">98%</div>
              <p className="text-slate-400 text-sm mt-2">Improvement Rate</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">24/7</div>
              <p className="text-slate-400 text-sm mt-2">Mentor Support</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">5min</div>
              <p className="text-slate-400 text-sm mt-2">Avg Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-cyan-500/50 transition duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                📊
              </div>
              <h3 className="text-xl font-bold mb-3">Daily Check-ins</h3>
              <p className="text-slate-400">
                Students log their focus time and quiz scores daily for real-time performance tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-blue-500/50 transition duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Detection</h3>
              <p className="text-slate-400">
                Advanced algorithms detect performance gaps and suspicious behavior instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-purple-500/50 transition duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center mb-6 text-2xl">
                👨‍🏫
              </div>
              <h3 className="text-xl font-bold mb-3">Mentor Intervention</h3>
              <p className="text-slate-400">
                Mentors provide personalized remedial tasks and guidance for struggling students.
              </p>
            </div>
          </div>

          {/* Workflow Diagram */}
          <div className="mt-20 bg-white/5 border border-white/10 rounded-xl p-12">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-4">1️⃣</div>
                <p className="font-semibold">Daily Checkin</p>
                <p className="text-sm text-slate-400 mt-2">Submit focus & quiz data</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">2️⃣</div>
                <p className="font-semibold">Analysis</p>
                <p className="text-sm text-slate-400 mt-2">System evaluates performance</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">3️⃣</div>
                <p className="font-semibold">Intervention</p>
                <p className="text-sm text-slate-400 mt-2">Mentor assigns remedial task</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">4️⃣</div>
                <p className="font-semibold">Completion</p>
                <p className="text-sm text-slate-400 mt-2">Return to normal routine</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-t border-b border-white/10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Improve?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Start your daily check-in and take control of your learning journey.
          </p>
          <Link
            to="/?studentId=demo-student"
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition duration-200 shadow-lg hover:shadow-xl inline-block"
          >
            Begin Check-in
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>© 2024 Alcovia Intervention Engine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
