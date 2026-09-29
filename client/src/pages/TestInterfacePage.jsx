import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { testService } from '../services/testService';
import { ExamHeader } from '../components/ExamHeader';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionPalette } from '../components/QuestionPalette';
import { ScientificCalculatorModal } from '../components/ScientificCalculatorModal';
import { QuestionPaperModal } from '../components/QuestionPaperModal';
import { SubmitModal } from '../components/SubmitModal';

export const TestInterfacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { initializeTest, submitActiveTest } = useTestStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isQuestionPaperOpen, setIsQuestionPaperOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const res = await testService.getTestById(id);
        if (res.data?.test) {
          // If already completed, redirect directly to result
          if (res.data.test.status === 'completed') {
            navigate(`/tests/${id}/result`);
            return;
          }
          initializeTest(res.data.test, res.data.attempt);
        } else {
          setError('Test not found.');
        }
      } catch (err) {
        setError('Failed to load test examination session.');
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [id, initializeTest, navigate]);

  const handleFinalSubmit = async () => {
    try {
      await submitActiveTest();
      setIsSubmitModalOpen(false);
      navigate(`/tests/${id}/result`);
    } catch (err) {
      alert('Failed to submit test. Please check network connection.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <h2 className="text-lg font-bold">Initializing Secure GATE Examination Environment...</h2>
        <p className="text-xs text-slate-400">Loading verified question bank snapshot & starting countdown timer</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">{error}</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-xl bg-blue-600 font-bold text-xs hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      
      {/* 1. Exam Header */}
      <ExamHeader
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenQuestionPaper={() => setIsQuestionPaperOpen(true)}
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
      />

      {/* 2. Main Exam Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center: Question Card */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <QuestionCard />
        </main>

        {/* Right Sidebar: Question Palette (320px) */}
        <aside className="w-80 hidden lg:block h-full">
          <QuestionPalette />
        </aside>
      </div>

      {/* 3. Modals */}
      <ScientificCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <QuestionPaperModal
        isOpen={isQuestionPaperOpen}
        onClose={() => setIsQuestionPaperOpen(false)}
      />

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleFinalSubmit}
      />

    </div>
  );
};
