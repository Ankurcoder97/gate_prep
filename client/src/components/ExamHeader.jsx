import React, { useEffect } from 'react';
import {
  Clock,
  Calculator,
  FileText,
  Send,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useTestStore } from '../store/testStore';

export const ExamHeader = ({ onOpenCalculator, onOpenQuestionPaper, onOpenSubmit }) => {
  const {
    activeTest,
    timeRemainingSeconds,
    decrementTimer,
    isTimerRunning,
    autosaveStatus,
    submitActiveTest,
  } = useTestStore();

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        decrementTimer();
      }, 1000);
    } else if (timeRemainingSeconds === 0 && isTimerRunning) {
      // Auto submit test when time expires!
      submitActiveTest().catch(() => {});
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemainingSeconds, decrementTimer, submitActiveTest]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const isLowTime = timeRemainingSeconds < 900; // Under 15 minutes
  const isCriticalTime = timeRemainingSeconds < 300; // Under 5 minutes

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-[1700px] mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Test Title & Branch */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/30">
            GATE
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-white truncate max-w-[280px] sm:max-w-md">
              {activeTest?.title || 'GATE Assessment'}
            </h1>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span>{activeTest?.totalMarks || 100} Marks</span>
              <span>•</span>
              <span>{activeTest?.questionCount || 65} Questions</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    autosaveStatus === 'synced'
                      ? 'bg-emerald-400'
                      : autosaveStatus === 'saving'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-red-400'
                  }`}
                />
                <span className="text-[10px] capitalize text-slate-300">
                  {autosaveStatus === 'synced' ? 'Autosaved' : autosaveStatus === 'saving' ? 'Saving...' : 'Sync Error'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div className="flex items-center justify-center">
          <div
            className={`flex items-center space-x-2.5 px-4 py-1.5 rounded-xl font-mono font-bold text-sm sm:text-lg tracking-wider border shadow-inner transition-colors ${
              isCriticalTime
                ? 'bg-red-950/80 border-red-600 text-red-400 animate-pulse'
                : isLowTime
                ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-emerald-400'
            }`}
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>
        </div>

        {/* Right: Tools & Submit */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Scientific Calculator */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            title="Open GATE Virtual Scientific Calculator"
          >
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Calculator</span>
          </button>

          {/* Question Paper Overview */}
          <button
            onClick={onOpenQuestionPaper}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            title="View Full Question Paper"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Paper</span>
          </button>

          {/* Submit Test Button */}
          <button
            onClick={onOpenSubmit}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>

      </div>
    </header>
  );
};
