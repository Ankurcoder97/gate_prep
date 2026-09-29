import { create } from 'zustand';
import { testService } from '../services/testService';

export const useTestStore = create((set, get) => ({
  activeTest: null,
  questions: [],
  currentIndex: 0,
  answers: {}, // map of questionId -> { selectedOptions, natAnswer, status, timeSpentSeconds }
  timeRemainingSeconds: 0,
  isSubmitting: false,
  isTimerRunning: false,
  autosaveStatus: 'synced', // 'synced' | 'saving' | 'error'

  initializeTest: (testData, attemptData) => {
    const questions = (testData.questions || []).map((q) => ({
      ...q.questionId,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      order: q.order,
      isRepeatedFallback: q.isRepeatedFallback,
      testQuestionRef: q._id,
    }));

    // Initialize answers from existing attempt if resuming
    const answersMap = {};
    questions.forEach((q) => {
      answersMap[q._id] = {
        selectedOptions: [],
        natAnswer: '',
        status: 'NOT_VISITED',
        timeSpentSeconds: 0,
      };
    });

    if (attemptData?.answers?.length) {
      attemptData.answers.forEach((ans) => {
        const qId = ans.questionId?._id || ans.questionId;
        if (qId && answersMap[qId]) {
          answersMap[qId] = {
            selectedOptions: ans.selectedOptions || [],
            natAnswer: ans.natAnswer !== undefined && ans.natAnswer !== null ? ans.natAnswer : '',
            status: ans.status || 'NOT_VISITED',
            timeSpentSeconds: ans.timeSpentSeconds || 0,
          };
        }
      });
    }

    // Set first question as visited if not visited yet
    if (questions.length > 0 && answersMap[questions[0]._id].status === 'NOT_VISITED') {
      answersMap[questions[0]._id].status = 'NOT_ANSWERED';
    }

    // Calculate initial time remaining from server expiration
    let remaining = (testData.durationMinutes || 180) * 60;
    if (testData.expiresAt) {
      const diffSec = Math.floor((new Date(testData.expiresAt).getTime() - Date.now()) / 1000);
      remaining = Math.max(0, diffSec);
    }

    set({
      activeTest: testData,
      questions,
      currentIndex: 0,
      answers: answersMap,
      timeRemainingSeconds: remaining,
      isTimerRunning: true,
      autosaveStatus: 'synced',
    });
  },

  setCurrentIndex: (index) => {
    const { questions, answers } = get();
    if (index < 0 || index >= questions.length) return;

    const targetQ = questions[index];
    const updatedAnswers = { ...answers };

    // Mark as visited/not answered if it was NOT_VISITED
    if (updatedAnswers[targetQ._id]?.status === 'NOT_VISITED') {
      updatedAnswers[targetQ._id].status = 'NOT_ANSWERED';
    }

    set({ currentIndex: index, answers: updatedAnswers });
  },

  updateAnswer: (questionId, newAnswerData) => {
    const { answers } = get();
    const current = answers[questionId] || {};
    const updated = {
      ...answers,
      [questionId]: {
        ...current,
        ...newAnswerData,
      },
    };
    set({ answers: updated, autosaveStatus: 'saving' });
  },

  saveAndNext: async () => {
    const { currentIndex, questions, answers, activeTest } = get();
    const currentQ = questions[currentIndex];
    const currentAns = answers[currentQ._id];

    // Determine status: if answered, status is ANSWERED
    const hasSelection =
      (currentAns.selectedOptions && currentAns.selectedOptions.length > 0) ||
      (currentAns.natAnswer !== '' && currentAns.natAnswer !== null && currentAns.natAnswer !== undefined);

    const newStatus = hasSelection ? 'ANSWERED' : 'NOT_ANSWERED';
    const updatedAns = { ...currentAns, status: newStatus };

    const newAnswers = {
      ...answers,
      [currentQ._id]: updatedAns,
    };

    set({ answers: newAnswers, autosaveStatus: 'saving' });

    // Sync answer to backend in background
    try {
      testService.saveAnswer(activeTest._id, {
        questionId: currentQ._id,
        selectedOptions: updatedAns.selectedOptions,
        natAnswer: updatedAns.natAnswer === '' ? undefined : parseFloat(updatedAns.natAnswer),
        status: newStatus,
        timeSpentSeconds: updatedAns.timeSpentSeconds || 0,
      });
      set({ autosaveStatus: 'synced' });
    } catch (e) {
      set({ autosaveStatus: 'error' });
    }

    // Move to next question if available
    if (currentIndex < questions.length - 1) {
      get().setCurrentIndex(currentIndex + 1);
    }
  },

  markForReviewAndNext: async () => {
    const { currentIndex, questions, answers, activeTest } = get();
    const currentQ = questions[currentIndex];
    const currentAns = answers[currentQ._id];

    const hasSelection =
      (currentAns.selectedOptions && currentAns.selectedOptions.length > 0) ||
      (currentAns.natAnswer !== '' && currentAns.natAnswer !== null && currentAns.natAnswer !== undefined);

    const newStatus = hasSelection
      ? 'ANSWERED_AND_MARKED_FOR_REVIEW'
      : 'MARKED_FOR_REVIEW';

    const updatedAns = { ...currentAns, status: newStatus };
    const newAnswers = { ...answers, [currentQ._id]: updatedAns };

    set({ answers: newAnswers, autosaveStatus: 'saving' });

    try {
      testService.saveAnswer(activeTest._id, {
        questionId: currentQ._id,
        selectedOptions: updatedAns.selectedOptions,
        natAnswer: updatedAns.natAnswer === '' ? undefined : parseFloat(updatedAns.natAnswer),
        status: newStatus,
        timeSpentSeconds: updatedAns.timeSpentSeconds || 0,
      });
      set({ autosaveStatus: 'synced' });
    } catch (e) {
      set({ autosaveStatus: 'error' });
    }

    if (currentIndex < questions.length - 1) {
      get().setCurrentIndex(currentIndex + 1);
    }
  },

  clearResponse: async () => {
    const { currentIndex, questions, answers, activeTest } = get();
    const currentQ = questions[currentIndex];

    const clearedAns = {
      selectedOptions: [],
      natAnswer: '',
      status: 'NOT_ANSWERED',
      timeSpentSeconds: answers[currentQ._id]?.timeSpentSeconds || 0,
    };

    const newAnswers = { ...answers, [currentQ._id]: clearedAns };
    set({ answers: newAnswers });

    try {
      await testService.saveAnswer(activeTest._id, {
        questionId: currentQ._id,
        selectedOptions: [],
        natAnswer: null,
        status: 'NOT_ANSWERED',
        timeSpentSeconds: 0,
      });
    } catch (e) {}
  },

  decrementTimer: () => {
    const { timeRemainingSeconds } = get();
    if (timeRemainingSeconds <= 1) {
      set({ timeRemainingSeconds: 0, isTimerRunning: false });
    } else {
      set({ timeRemainingSeconds: timeRemainingSeconds - 1 });
    }
  },

  submitActiveTest: async () => {
    const { activeTest, answers } = get();
    if (!activeTest) return;

    set({ isSubmitting: true, isTimerRunning: false });

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        selectedOptions: ans.selectedOptions,
        natAnswer: ans.natAnswer === '' ? undefined : parseFloat(ans.natAnswer),
        status: ans.status,
        timeSpentSeconds: ans.timeSpentSeconds || 0,
      }));

      const res = await testService.submitTest(activeTest._id, {
        answers: formattedAnswers,
      });

      set({ isSubmitting: false });
      return res.data;
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },
}));
