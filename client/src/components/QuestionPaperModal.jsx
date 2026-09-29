import React from 'react';
import { X, FileText } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { KaTeXRenderer } from './KaTeXRenderer';

export const QuestionPaperModal = ({ isOpen, onClose }) => {
  const { questions, setCurrentIndex } = useTestStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Full Question Paper Overview</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q._id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-blue-600 dark:text-blue-400">Q.{idx + 1}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {q.questionType} ({q.marks} Mark{q.marks > 1 ? 's' : ''})
                  </span>
                  <span className="text-xs text-slate-500">{q.subjectId?.name}</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentIndex(idx);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-blue-100"
                >
                  Jump to Question
                </button>
              </div>

              <div className="text-sm text-slate-800 dark:text-slate-200">
                <KaTeXRenderer text={q.questionText} />
              </div>

              {q.options?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  {q.options.map((opt) => (
                    <div key={opt.key} className="flex space-x-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300">({opt.key})</span>
                      <KaTeXRenderer text={opt.text} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
