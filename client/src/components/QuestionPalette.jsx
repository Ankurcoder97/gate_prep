import React, { useState } from 'react';
import { useTestStore } from '../store/testStore';
import { Check, Bookmark, Eye, HelpCircle } from 'lucide-react';

export const QuestionPalette = () => {
  const { questions, currentIndex, setCurrentIndex, answers } = useTestStore();
  const [selectedSection, setSelectedSection] = useState('ALL');

  // Compute status counts
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

  // Extract distinct subjects/sections for filtering
  const sections = ['ALL'];
  questions.forEach((q) => {
    const subName = q.subjectId?.name || 'Core';
    if (!sections.includes(subName)) sections.push(subName);
  });

  // Filter questions by section if selected
  const filteredQuestions = questions.map((q, idx) => ({ ...q, originalIndex: idx })).filter((q) => {
    if (selectedSection === 'ALL') return true;
    return (q.subjectId?.name || 'Core') === selectedSection;
  });

  // Get status class for button
  const getStatusButtonClass = (questionId, index) => {
    const isCurrent = currentIndex === index;
    const status = answers[questionId]?.status || 'NOT_VISITED';

    let baseBg = '';
    let textColor = 'text-white';

    if (status === 'ANSWERED') {
      baseBg = 'bg-emerald-600 hover:bg-emerald-500';
    } else if (status === 'NOT_ANSWERED') {
      baseBg = 'bg-rose-600 hover:bg-rose-500';
    } else if (status === 'MARKED_FOR_REVIEW') {
      baseBg = 'bg-purple-600 hover:bg-purple-500';
    } else if (status === 'ANSWERED_AND_MARKED_FOR_REVIEW') {
      baseBg = 'bg-blue-600 hover:bg-blue-500 relative ring-2 ring-purple-400';
    } else {
      // NOT_VISITED
      baseBg = 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200';
      textColor = 'text-slate-800 dark:text-slate-200';
    }

    const currentRing = isCurrent
      ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 font-extrabold scale-105 z-10'
      : '';

    return `${baseBg} ${textColor} ${currentRing}`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 select-none">
      
      {/* Palette Legend */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Question Palette
        </h3>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
              {answeredCount}
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">Answered</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
              {notAnsweredCount}
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">Not Answered</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
              {markedCount}
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">Marked Review</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-blue-600 ring-1 ring-purple-400 text-white flex items-center justify-center font-bold text-[10px]">
              {answeredMarkedCount}
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-tight">Ans & Marked</span>
          </div>

          <div className="flex items-center space-x-2 col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
              {notVisitedCount}
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">Not Visited</span>
          </div>
        </div>
      </div>

      {/* Section Filter Tabs */}
      {sections.length > 2 && (
        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none flex space-x-1">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                selectedSection === sec
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      )}

      {/* Questions Grid */}
      <div className="flex-1 p-3.5 overflow-y-auto">
        <div className="grid grid-cols-5 gap-2">
          {filteredQuestions.map((q) => {
            const btnClass = getStatusButtonClass(q._id, q.originalIndex);
            return (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(q.originalIndex)}
                className={`h-9 rounded-lg font-semibold text-xs flex items-center justify-center shadow-sm transition-transform active:scale-95 ${btnClass}`}
              >
                {q.originalIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
