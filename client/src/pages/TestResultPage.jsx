import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Filter,
} from 'lucide-react';
import { testService } from '../services/testService';
import { KaTeXRenderer } from '../components/KaTeXRenderer';

export const TestResultPage = () => {
  const { id } = useParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionFilter, setQuestionFilter] = useState('ALL'); // ALL, CORRECT, INCORRECT, UNATTEMPTED

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await testService.getTestResult(id);
        if (res.data) {
          setResultData(res.data);
          // Trigger confetti celebration on high score!
          if (res.data.attempt?.accuracy >= 60) {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          }
        }
      } catch (err) {
        console.error('Failed to load result', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Evaluating GATE scoring breakdown...</p>
      </div>
    );
  }

  if (!resultData?.attempt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Result Not Found</h2>
        <p className="text-sm text-slate-500">Could not retrieve submission results for this assessment.</p>
        <Link to="/dashboard" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { test, attempt } = resultData;
  const percentage = Math.round((attempt.totalScore / attempt.totalMarks) * 100);

  // Filter questions
  const filteredAnswers = (attempt.answers || []).filter((ans) => {
    if (questionFilter === 'CORRECT') return ans.isCorrect;
    if (questionFilter === 'INCORRECT') {
      const isAttempted =
        (ans.selectedOptions && ans.selectedOptions.length > 0) ||
        (ans.natAnswer !== undefined && ans.natAnswer !== null && !isNaN(ans.natAnswer));
      return isAttempted && !ans.isCorrect;
    }
    if (questionFilter === 'UNATTEMPTED') {
      const isAttempted =
        (ans.selectedOptions && ans.selectedOptions.length > 0) ||
        (ans.natAnswer !== undefined && ans.natAnswer !== null && !isNaN(ans.natAnswer));
      return !isAttempted;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Score Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl border border-blue-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Official GATE Evaluation Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{test.title}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Strict GATE marking rules applied (+1/+2 Marks, -0.33/-0.66 for incorrect MCQs, 0 penalty for MSQ/NAT).
          </p>
        </div>

        {/* Big Score Card */}
        <div className="bg-white/10 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/20 text-center min-w-[200px]">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Marks Obtained</div>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">
            {attempt.totalScore}
            <span className="text-base sm:text-xl font-normal text-slate-300"> / {attempt.totalMarks}</span>
          </div>
          <div className="text-xs font-bold text-emerald-400 mt-1">
            {percentage}% ({attempt.accuracy}% Accuracy)
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Correct Answers</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{attempt.correctCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Full marks awarded</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-rose-500 text-xs font-bold uppercase mb-1">
            <XCircle className="w-4 h-4" />
            <span>Incorrect Answers</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{attempt.incorrectCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Negative marks penalized</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Unattempted</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{attempt.unattemptedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">0 marks awarded</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Overall Accuracy</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{attempt.accuracy}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Correct / Total Attempted</div>
        </div>
      </div>

      {/* Subject-Wise & Topic-Wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subject Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span>Subject-Wise Performance</span>
          </h3>

          <div className="space-y-3">
            {(attempt.subjectWiseScores || []).map((sub) => (
              <div
                key={sub.subjectName}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                  <span>{sub.subjectName}</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {sub.obtainedMarks} / {sub.totalMarks} Marks
                  </span>
                </div>
                {/* Accuracy progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, sub.accuracy))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{sub.correctCount} Correct • {sub.incorrectCount} Incorrect</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.accuracy}% Accuracy</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Topic-Wise Breakdown</span>
          </h3>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {(attempt.topicWiseScores || []).map((top) => (
              <div
                key={top.topicName}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                  {top.topicName}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 font-mono">
                    {top.correctCount} / {top.correctCount + top.incorrectCount + top.unattemptedCount}
                  </span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded-full text-[10px] ${
                      top.accuracy >= 70
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : top.accuracy >= 40
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {top.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Question Review Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
              <FileCheck2 className="w-5 h-5 text-blue-500" />
              <span>Detailed Question Analysis & Verified Solutions</span>
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredAnswers.length} of {attempt.answers?.length} questions
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            {['ALL', 'CORRECT', 'INCORRECT', 'UNATTEMPTED'].map((f) => (
              <button
                key={f}
                onClick={() => setQuestionFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  questionFilter === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Questions Detailed List */}
        <div className="space-y-6">
          {filteredAnswers.map((ans, idx) => {
            const q = ans.questionId;
            if (!q) return null;

            const isAnswered =
              (ans.selectedOptions && ans.selectedOptions.length > 0) ||
              (ans.natAnswer !== undefined && ans.natAnswer !== null && !isNaN(ans.natAnswer));

            const studentText = q.questionType === 'NAT'
              ? (ans.natAnswer !== undefined ? String(ans.natAnswer) : 'Not Answered')
              : (ans.selectedOptions?.join(', ') || 'Not Answered');

            const correctText = Array.isArray(q.correctAnswer)
              ? q.correctAnswer.join(', ')
              : String(q.correctAnswer);

            return (
              <div
                key={q._id}
                className={`p-6 rounded-2xl border space-y-4 ${
                  ans.isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : isAnswered
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Q.{idx + 1}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {q.questionType} ({q.marks} Mark{q.marks > 1 ? 's' : ''})
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{q.subjectId?.name}</span>
                    {q.year && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {q.paper || `GATE ${q.year}`}
                      </span>
                    )}
                  </div>

                  <div>
                    {ans.isCorrect ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>+{ans.marksAwarded} Marks</span>
                      </span>
                    ) : isAnswered ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2.5 py-1 rounded-lg">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>-{ans.negativeMarksDeducted} Marks</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        0 Marks (Unattempted)
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed font-normal">
                  <KaTeXRenderer text={q.questionText} />
                </div>

                {/* Options if MCQ/MSQ */}
                {q.options?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => {
                      const isCorrectChoice =
                        (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.key)) ||
                        q.correctAnswer === opt.key;

                      const isStudentChoice = (ans.selectedOptions || []).includes(opt.key);

                      let optClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                      if (isCorrectChoice) {
                        optClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold';
                      } else if (isStudentChoice && !isCorrectChoice) {
                        optClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
                      }

                      return (
                        <div key={opt.key} className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${optClass}`}>
                          <span className="font-bold shrink-0">({opt.key})</span>
                          <div className="flex-1">
                            <KaTeXRenderer text={opt.text} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Answer Summary Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500">Your Answer:</span>
                    <span className={`font-mono font-bold ${ans.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {studentText}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500">Correct Answer:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {correctText}
                    </span>
                  </div>
                </div>

                {/* Verified Explanation */}
                {q.explanation && (
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1">
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      Step-by-Step Explanation:
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <KaTeXRenderer text={q.explanation} />
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-center space-x-4 pt-4">
        <Link
          to="/generate-test"
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Generate Another Assessment</span>
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

    </div>
  );
};
