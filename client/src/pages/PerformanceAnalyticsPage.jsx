import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  PieChart,
  HelpCircle,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

export const PerformanceAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getUserAnalytics().then((res) => {
      if (res.data) setAnalytics(res.data);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Aggregating performance analytics...</p>
      </div>
    );
  }

  const { summary, testProgress, subjectPerformance, strongTopics, weakTopics, allTopicStats } = analytics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
          <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
          <span>Real-Time Mastery Analytics</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Performance & Syllabus Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Deep-dive analysis into your subject accuracy, unseen question coverage, and topic strengths.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Average Score</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{summary?.averageScore || 0}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Across {summary?.totalTests || 0} tests</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Overall Accuracy</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{summary?.overallAccuracy || 0}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{summary?.totalCorrect} correct answers</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Question Bank Coverage</div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {summary?.totalBankQuestions > 0
              ? Math.round((summary.attemptedDistinctQuestions / summary.totalBankQuestions) * 100)
              : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{summary?.attemptedDistinctQuestions} attempted / {summary?.totalBankQuestions} total</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Unseen Questions</div>
          <div className="text-3xl font-black text-amber-500 font-mono">{summary?.unseenQuestionsCount || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for next tests</div>
        </div>
      </div>

      {/* Subject Mastery Progress Bars */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <span>Subject Mastery Breakdown</span>
        </h2>

        {(!subjectPerformance || subjectPerformance.length === 0) ? (
          <p className="text-sm text-slate-400 italic">No subject data recorded yet. Attempt a test to populate analytics!</p>
        ) : (
          <div className="space-y-4">
            {subjectPerformance.map((sub) => (
              <div key={sub.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sub.name}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {sub.accuracy}% <span className="text-xs font-normal text-slate-400">({sub.correct}/{sub.attempts} correct)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.accuracy >= 75
                        ? 'bg-emerald-500'
                        : sub.accuracy >= 50
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(5, sub.accuracy)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weak vs Strong Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Strong Topics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Strong Topics (&ge; 70%)</h3>
          </div>

          {(!strongTopics || strongTopics.length === 0) ? (
            <p className="text-xs text-slate-400 italic">No strong topics identified yet.</p>
          ) : (
            <div className="space-y-2.5">
              {strongTopics.map((top) => (
                <div key={top.name} className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-emerald-950 dark:text-emerald-300">{top.name}</div>
                    <div className="text-[10px] text-slate-500">{top.subjectName}</div>
                  </div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {top.accuracy}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Topics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Weak Topics (&lt; 60%)</h3>
          </div>

          {(!weakTopics || weakTopics.length === 0) ? (
            <p className="text-xs text-slate-400 italic">No weak topics identified yet.</p>
          ) : (
            <div className="space-y-2.5">
              {weakTopics.map((top) => (
                <div key={top.name} className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-rose-950 dark:text-rose-300">{top.name}</div>
                    <div className="text-[10px] text-slate-500">{top.subjectName}</div>
                  </div>
                  <div className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {top.accuracy}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
