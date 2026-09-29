import React from 'react';
import { X, CheckCircle2, AlertCircle, Bookmark, EyeOff, Loader2 } from 'lucide-react';
import { useTestStore } from '../store/testStore';

export const SubmitModal = ({ isOpen, onClose, onConfirm }) => {
  const { questions, answers, isSubmitting } = useTestStore();

  if (!isOpen) return null;

  let answeredCount = 0;
  let notAnsweredCount = 0;
  let markedCount = 0;
  let answeredMarkedCount = 0;
  let notVisitedCount = 0;

  questions.forEach((q) => {
    const status = answers[q._id]?.status || 'NOT_VISITED';
    if (status === 'ANSWERED') answeredCount++;
    else if (status === 'NOT_ANSWERED') notAnsweredCount++;
    else if (status === 'MARKED_FOR_REVIEW') markedCount++;
    else if (status === 'ANSWERED_AND_MARKED_FOR_REVIEW') answeredMarkedCount++;
    else notVisitedCount++;
  });

  const totalAttempted = answeredCount + answeredMarkedCount;
  const unattempted = notAnsweredCount + notVisitedCount + markedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Submit Examination?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Review your attempt summary before final submission.</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalAttempted}</div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Answered Questions</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{unattempted}</div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Unanswered Questions</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Marked for Review:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{markedCount}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Answered & Marked for Review:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{answeredMarkedCount}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Not Visited:</span>
              <span className="font-bold text-slate-500">{notVisitedCount}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Total Test Questions:</span>
              <span>{questions.length}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            * Note: Once submitted, your test will be instantly evaluated with GATE marking rules and recorded in your performance history.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Resume Test
          </button>

          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Confirm & Submit</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
