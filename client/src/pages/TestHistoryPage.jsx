import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Calendar, CheckCircle2, ArrowRight, Trophy, Zap, Layers, BookOpen } from 'lucide-react';
import { testService } from '../services/testService';

export const TestHistoryPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testService.getTestHistory().then((res) => {
      if (res.data) setAttempts(res.data);
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
        <p className="text-sm font-semibold text-slate-500">Loading your test history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Attempt Log</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Past Test History
          </h1>
          <p className="text-xs text-slate-500">
            Review detailed question analysis, scores, and progress from all your past assessments.
          </p>
        </div>

        <Link
          to="/generate-test"
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center space-x-1.5 w-fit"
        >
          <span>Generate New Test</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {attempts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <History className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Test History Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not attempted any GATE assessments yet. Click the button below to generate your first test!
          </p>
          <Link
            to="/generate-test"
            className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
          >
            Start First Test
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => {
            const dateStr = new Date(att.submittedAt || att.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={att._id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {att.testId?.title || 'GATE Assessment'}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {att.testId?.testType || 'TOPIC'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{att.correctCount} Correct</span>
                    <span>•</span>
                    <span className="text-rose-500 font-semibold">{att.incorrectCount} Incorrect</span>
                    <span>•</span>
                    <span>{att.unattemptedCount} Unattempted</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-mono font-black text-2xl text-slate-900 dark:text-white">
                      {att.totalScore}
                      <span className="text-xs font-normal text-slate-400"> / {att.totalMarks}</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {att.accuracy}% Accuracy
                    </div>
                  </div>

                  <Link
                    to={`/tests/${att.testId?._id || att.testId}/result`}
                    className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    View Solutions
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
