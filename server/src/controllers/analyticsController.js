import { TestAttempt } from '../models/TestAttempt.js';
import { Question } from '../models/Question.js';
import { UserQuestionHistory } from '../models/UserQuestionHistory.js';
import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';

export const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const branchId = req.user.selectedBranch?._id || req.user.selectedBranch;

    // Fetch all test attempts
    const attempts = await TestAttempt.find({ userId })
      .populate('testId', 'title testType')
      .sort({ createdAt: 1 });

    const totalTests = attempts.length;

    let totalMarksAttempted = 0;
    let totalScoreObtained = 0;
    let bestScore = 0;
    let totalQuestionsAttempted = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    const testProgress = [];

    attempts.forEach((a, idx) => {
      totalMarksAttempted += a.totalMarks || 100;
      totalScoreObtained += a.totalScore || 0;
      if (a.totalScore > bestScore) bestScore = a.totalScore;
      totalQuestionsAttempted += (a.correctCount || 0) + (a.incorrectCount || 0);
      totalCorrect += a.correctCount || 0;
      totalIncorrect += a.incorrectCount || 0;

      testProgress.push({
        testNumber: idx + 1,
        title: a.testId?.title || `Test #${idx + 1}`,
        score: a.totalScore,
        totalMarks: a.totalMarks,
        accuracy: a.accuracy,
        date: a.submittedAt || a.createdAt,
      });
    });

    const averageScore = totalTests > 0 ? Math.round((totalScoreObtained / totalTests) * 10) / 10 : 0;
    const overallAccuracy =
      totalQuestionsAttempted > 0
        ? Math.round((totalCorrect / totalQuestionsAttempted) * 1000) / 10
        : 0;

    // Total questions in branch question bank
    let totalBankQuestions = 0;
    let unseenQuestionsCount = 0;

    if (branchId) {
      totalBankQuestions = await Question.countDocuments({ branchId, verified: true });
      const attemptedDistinct = await UserQuestionHistory.countDocuments({ userId, branchId });
      unseenQuestionsCount = Math.max(0, totalBankQuestions - attemptedDistinct);
    }

    // Aggregated Subject and Topic Performance from UserQuestionHistory
    const histories = await UserQuestionHistory.find({ userId })
      .populate('subjectId', 'name category')
      .populate('topicId', 'name');

    const subjectMap = new Map();
    const topicMap = new Map();

    histories.forEach((h) => {
      if (h.subjectId) {
        const sName = h.subjectId.name;
        if (!subjectMap.has(sName)) {
          subjectMap.set(sName, { name: sName, attempts: 0, correct: 0 });
        }
        const s = subjectMap.get(sName);
        s.attempts += h.attemptCount || 1;
        s.correct += h.correctCount || 0;
      }

      if (h.topicId) {
        const tName = h.topicId.name;
        const sName = h.subjectId?.name || 'General';
        if (!topicMap.has(tName)) {
          topicMap.set(tName, { name: tName, subjectName: sName, attempts: 0, correct: 0 });
        }
        const t = topicMap.get(tName);
        t.attempts += h.attemptCount || 1;
        t.correct += h.correctCount || 0;
      }
    });

    const subjectPerformance = Array.from(subjectMap.values()).map((s) => ({
      name: s.name,
      attempts: s.attempts,
      correct: s.correct,
      accuracy: s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0,
    }));

    const topicStats = Array.from(topicMap.values()).map((t) => ({
      name: t.name,
      subjectName: t.subjectName,
      attempts: t.attempts,
      correct: t.correct,
      accuracy: t.attempts > 0 ? Math.round((t.correct / t.attempts) * 100) : 0,
    }));

    const strongTopics = topicStats.filter((t) => t.accuracy >= 70 && t.attempts >= 2);
    const weakTopics = topicStats.filter((t) => t.accuracy < 60 && t.attempts >= 1);

    res.json({
      success: true,
      data: {
        summary: {
          totalTests,
          averageScore,
          bestScore,
          overallAccuracy,
          totalQuestionsAttempted,
          totalCorrect,
          totalIncorrect,
          totalBankQuestions,
          unseenQuestionsCount,
          attemptedDistinctQuestions: totalBankQuestions - unseenQuestionsCount,
        },
        testProgress,
        subjectPerformance,
        strongTopics,
        weakTopics,
        allTopicStats: topicStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
