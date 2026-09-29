import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  BookOpen,
  Sliders,
  BarChart3,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { analyticsService } from '../services/analyticsService';
import { testService } from '../services/testService';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          analyticsService.getUserAnalytics(),
          testService.getTestHistory(),
        ]);
        if (analyticsRes.data) setAnalytics(analyticsRes.data);
        if (historyRes.data) setRecentAttempts(historyRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const summary = analytics?.summary || {
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    overallAccuracy: 0,
    totalBankQuestions: 0,
    unseenQuestionsCount: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl border border-blue-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Exam: GATE {user?.targetYear || 2026}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Prepare smarter for GATE.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Select any combination of topics, generate a dynamic 100-mark assessment, and let our no-repeat algorithm protect you from redundant questions.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/generate-test"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5"
            >
              <span>Generate Test</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/generate-test?type=FULL_LENGTH"
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center space-x-1.5"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Full Length Mock</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link
          to="/generate-test?type=TOPIC"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Practice by Topic</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Combine granular topics like TOC + General Aptitude with strict isolation.
          </p>
        </Link>

        <Link
          to="/generate-test?type=FULL_LENGTH"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Full Length GATE Test</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exact 100-mark mock following standard GA (15M) and Core (85M) distribution.
          </p>
        </Link>

        <Link
          to="/generate-test?type=SUBJECT"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Subject Assessment</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deep dive into a complete subject (e.g. Operating Systems or Algorithms).
          </p>
        </Link>

        <Link
          to="/generate-test?type=CUSTOM"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Custom Test</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tune marks, difficulty, question types (MCQ/MSQ/NAT), and year range.
          </p>
        </Link>

      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Tests Attempted</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{summary.totalTests}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">Recorded assessments</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Overall Accuracy</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{summary.overallAccuracy}%</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across all question types</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Best Score</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">{summary.bestScore} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Highest 100-mark mock</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Unseen Questions</div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{summary.unseenQuestionsCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Available in question bank</div>
        </div>

      </div>

      {/* Two-Column Section: Recent Tests & Weak/Strong Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Tests History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <History className="w-5 h-5 text-blue-500" />
              <span>Recent Test Attempts</span>
            </h2>
            <Link to="/history" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              View All History &rarr;
            </Link>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No test attempts yet. Click "Generate Test" above to start your first assessment!
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((att) => (
                <div
                  key={att._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-sm">
                      {att.testId?.title || 'GATE Assessment'}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span>{new Date(att.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{att.correctCount} Correct</span>
                      <span>•</span>
                      <span>{att.incorrectCount} Incorrect</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                        {att.totalScore} <span className="text-xs font-normal text-slate-400">/ {att.totalMarks}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {att.accuracy}% Accuracy
                      </div>
                    </div>

                    <Link
                      to={`/tests/${att.testId?._id || att.testId}/result`}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    >
                      Analysis
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Weak & Strong Topics Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          
          {/* Strong Areas */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Strong Topics (&ge; 70%)</span>
            </h3>
            {analytics?.strongTopics?.length ? (
              <div className="space-y-2">
                {analytics.strongTopics.slice(0, 3).map((top) => (
                  <div key={top.name} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex justify-between items-center text-xs">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300 truncate max-w-[150px]">{top.name}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{top.accuracy}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Complete more tests to uncover your strongest topics.</p>
            )}
          </div>

          {/* Weak Areas */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Weak Topics (&lt; 60%)</span>
            </h3>
            {analytics?.weakTopics?.length ? (
              <div className="space-y-2">
                {analytics.weakTopics.slice(0, 3).map((top) => (
                  <div key={top.name} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 flex justify-between items-center text-xs">
                    <span className="font-semibold text-rose-900 dark:text-rose-300 truncate max-w-[150px]">{top.name}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">{top.accuracy}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No weak topics identified yet. Keep testing!</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
