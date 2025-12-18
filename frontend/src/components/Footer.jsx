// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 border-t transition-colors duration-300
                     bg-slate-900 border-slate-800 text-white
                     dark:bg-[#05050A] dark:border-white/10 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-600 dark:to-blue-600">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 dark:from-cyan-400 dark:to-blue-500">Quizito</span>
            </div>
            <p className="text-slate-400 dark:text-gray-400">
              Revolutionizing learning with AI-powered quizzes and real-time engagement.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link to="/create-quiz" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">Create Quiz</Link></li>
              <li><Link to="/JoinQuiz" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">Join Quiz</Link></li>
              <li><Link to="/Leaderboard" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">Leaderboard</Link></li>
              <li><Link to="/admin" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white dark:text-gray-400 dark:hover:text-cyan-400 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-slate-400 dark:text-gray-400">support@quizito.com</li>
              <li className="text-slate-400 dark:text-gray-400">+91 9556128887</li>
              <li className="text-slate-400 dark:text-gray-400">Kattankulathur, Chennai</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 flex flex-col md:flex-row justify-between items-center border-t border-slate-800 dark:border-white/10">
          <p className="text-slate-500 dark:text-gray-500 text-sm">
            © {new Date().getFullYear()} Quizito. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-slate-500 hover:text-white dark:text-gray-500 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-slate-500 hover:text-white dark:text-gray-500 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-white dark:text-gray-500 dark:hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
