import React from 'react';
import { useTestStore } from '../store/testStore';
import { KaTeXRenderer } from './KaTeXRenderer';
import {
  Bookmark,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';

export const QuestionCard = () => {
  const {
    questions,
    currentIndex,
    setCurrentIndex,
    answers,
    updateAnswer,
    saveAndNext,
    markForReviewAndNext,
    clearResponse,
  } = useTestStore();

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ?._id] || {
    selectedOptions: [],
    natAnswer: '',
    status: 'NOT_VISITED',
  };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  // Handle MCQ Option Click
  const handleMcqSelect = (key) => {
    updateAnswer(currentQ._id, {
      selectedOptions: [key],
      status: 'ANSWERED',
    });
  };

  // Handle MSQ Option Click
  const handleMsqToggle = (key) => {
    const prev = currentAnswer.selectedOptions || [];
    const exists = prev.includes(key);
    const updated = exists ? prev.filter((k) => k !== key) : [...prev, key];

    updateAnswer(currentQ._id, {
      selectedOptions: updated,
      status: updated.length > 0 ? 'ANSWERED' : 'NOT_ANSWERED',
    });
  };

  // Handle NAT Input
  const handleNatChange = (val) => {
    updateAnswer(currentQ._id, {
      natAnswer: val,
      status: val !== '' ? 'ANSWERED' : 'NOT_ANSWERED',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Top Meta Bar */}
      <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            Question {currentIndex + 1}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {currentQ.subjectId?.name || 'Core'}
          </span>
          {currentQ.topicId?.name && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hidden md:inline">
              {currentQ.topicId.name}
            </span>
          )}
          {currentQ.paper && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {currentQ.paper} {currentQ.sourceQuestionNumber ? `• Q.${currentQ.sourceQuestionNumber}` : ''}
            </span>
          )}
          {currentQ.isRepeatedFallback && (
            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              Revision Practice
            </span>
          )}
        </div>

        {/* Question Type & Marks Indicator */}
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
              currentQ.questionType === 'MCQ'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                : currentQ.questionType === 'MSQ'
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {currentQ.questionType}
          </span>

          <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{currentQ.marks}</span>
            {currentQ.negativeMarks > 0 && (
              <span className="text-rose-500 dark:text-rose-400 font-bold">
                -{currentQ.negativeMarks}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Question Body & Options */}
      <div className="flex-1 p-6 overflow-y-auto max-w-4xl w-full mx-auto space-y-6">
        
        {/* Question Text */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed text-slate-900 dark:text-slate-100 text-sm sm:text-base font-normal">
          <KaTeXRenderer text={currentQ.questionText} />

          {currentQ.imageUrl && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <img
                src={currentQ.imageUrl}
                alt="Question Diagram"
                className="max-h-80 rounded-lg border border-slate-200 dark:border-slate-700 object-contain shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Options / Input Field */}
        <div className="space-y-3">
          {/* MCQ Option Radios */}
          {currentQ.questionType === 'MCQ' && (
            <div className="space-y-2.5">
              {currentQ.options?.map((opt) => {
                const isSelected = (currentAnswer.selectedOptions || [])[0] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleMcqSelect(opt.key)}
                    className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all flex items-start space-x-3.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-medium shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <div className="flex-1 pt-0.5">
                      <KaTeXRenderer text={opt.text} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* MSQ Option Checkboxes */}
          {currentQ.questionType === 'MSQ' && (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/30 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800/50 mb-2">
                <Info className="w-4 h-4" />
                <span>Multiple Select Question (MSQ): One or more options can be correct. No negative marks.</span>
              </div>
              {currentQ.options?.map((opt) => {
                const isSelected = (currentAnswer.selectedOptions || []).includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleMsqToggle(opt.key)}
                    className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all flex items-start space-x-3.5 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 font-medium shadow-sm ring-1 ring-purple-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : opt.key}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <KaTeXRenderer text={opt.text} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* NAT Numerical Input */}
          {currentQ.questionType === 'NAT' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <Info className="w-4 h-4" />
                <span>Numerical Answer Type (NAT): Enter a real number rounded to 2 decimal places. No negative marks.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Your Answer:
                </label>
                <div className="flex items-center space-x-3 max-w-xs">
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 4.5"
                    value={currentAnswer.natAnswer !== undefined ? currentAnswer.natAnswer : ''}
                    onChange={(e) => handleNatChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Action Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        {/* Left: Previous & Clear */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentIndex(currentIndex - 1)}
            disabled={isFirst}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={clearResponse}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Response</span>
          </button>
        </div>

        {/* Right: Mark For Review & Save Next */}
        <div className="flex items-center space-x-2">
          <button
            onClick={markForReviewAndNext}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Mark for Review & Next</span>
          </button>

          <button
            onClick={saveAndNext}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:scale-105"
          >
            <span>{isLast ? 'Save Response' : 'Save & Next'}</span>
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

    </div>
  );
};
