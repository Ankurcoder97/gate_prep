import { Test } from '../models/Test.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { Question } from '../models/Question.js';
import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';
import { UserQuestionHistory } from '../models/UserQuestionHistory.js';
import { TestEngineService } from '../services/testEngineService.js';
import { MarkingService } from '../services/markingService.js';

export const generateTest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await TestEngineService.generateTest(userId, req.body);

    if (result.isInsufficientPool) {
      return res.status(200).json({
        success: false,
        code: 'INSUFFICIENT_QUESTION_POOL',
        data: result,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Test generated successfully',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code || 'TEST_GEN_ERROR',
        message: error.message,
      });
    }
    next(error);
  }
};

export const getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('branchId', 'name code')
      .populate('selectedSubjects', 'name category')
      .populate('selectedTopics', 'name')
      .populate({
        path: 'questions.questionId',
        select: 'questionText options questionType marks negativeMarks mathLatex imageUrl difficulty year paper subjectId topicId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'topicId', select: 'name' },
        ],
      });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Check existing attempt if any
    const attempt = await TestAttempt.findOne({ testId: test._id, userId: req.user._id });

    res.json({
      success: true,
      data: {
        test,
        attempt: attempt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const startTest = async (req, res, next) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, userId: req.user._id });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    let attempt = await TestAttempt.findOne({ testId: test._id, userId: req.user._id });

    const now = new Date();
    const durationMs = (test.durationMinutes || 180) * 60 * 1000;
    const expiresAt = new Date(now.getTime() + durationMs);

    if (!test.startedAt) {
      test.startedAt = now;
      test.expiresAt = expiresAt;
      test.status = 'in_progress';
      await test.save();
    }

    if (!attempt) {
      // Initialize blank answers palette
      const initialAnswers = test.questions.map((q) => ({
        questionId: q.questionId,
        selectedOptions: [],
        natAnswer: undefined,
        status: 'NOT_VISITED',
        timeSpentSeconds: 0,
      }));

      attempt = await TestAttempt.create({
        userId: req.user._id,
        testId: test._id,
        branchId: test.branchId,
        answers: initialAnswers,
        totalMarks: test.totalMarks,
      });
    }

    res.json({
      success: true,
      message: 'Test started',
      data: {
        testId: test._id,
        startedAt: test.startedAt,
        expiresAt: test.expiresAt,
        durationMinutes: test.durationMinutes,
        attempt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saveAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedOptions, natAnswer, status, timeSpentSeconds } = req.body;
    const testId = req.params.id;

    let attempt = await TestAttempt.findOne({ testId, userId: req.user._id });
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Active attempt not found' });
    }

    const ansIndex = attempt.answers.findIndex(
      (a) => a.questionId.toString() === questionId.toString()
    );

    if (ansIndex > -1) {
      if (selectedOptions !== undefined) attempt.answers[ansIndex].selectedOptions = selectedOptions;
      if (natAnswer !== undefined) attempt.answers[ansIndex].natAnswer = natAnswer;
      if (status !== undefined) attempt.answers[ansIndex].status = status;
      if (timeSpentSeconds !== undefined) attempt.answers[ansIndex].timeSpentSeconds += timeSpentSeconds;
    } else {
      attempt.answers.push({
        questionId,
        selectedOptions: selectedOptions || [],
        natAnswer,
        status: status || 'NOT_VISITED',
        timeSpentSeconds: timeSpentSeconds || 0,
      });
    }

    await attempt.save();

    res.json({
      success: true,
      message: 'Answer autosaved',
      data: {
        questionId,
        status: ansIndex > -1 ? attempt.answers[ansIndex].status : status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitTest = async (req, res, next) => {
  try {
    const testId = req.params.id;
    const test = await Test.findOne({ _id: testId, userId: req.user._id });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    let attempt = await TestAttempt.findOne({ testId, userId: req.user._id });
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt record not found' });
    }

    // Optional frontend payload can contain full answers state at submit
    const submittedAnswers = req.body.answers || attempt.answers;

    // Fetch full questions with correct answers
    const questionIds = test.questions.map((q) => q.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } })
      .populate('subjectId', 'name category')
      .populate('topicId', 'name');

    const questionMap = new Map();
    questions.forEach((q) => questionMap.set(q._id.toString(), q));

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let totalTimeSpent = 0;

    const evaluatedAnswers = [];
    const subjectStatsMap = new Map();
    const topicStatsMap = new Map();

    for (const tq of test.questions) {
      const qDoc = questionMap.get(tq.questionId.toString());
      if (!qDoc) continue;

      const studentAns = submittedAnswers.find(
        (a) => (a.questionId?._id || a.questionId).toString() === qDoc._id.toString()
      );

      const evaluation = MarkingService.evaluateAnswer(qDoc, studentAns);

      const markNet = evaluation.isCorrect
        ? evaluation.marksAwarded
        : -evaluation.negativeMarksDeducted;

      totalScore += markNet;

      const isAnswered = studentAns && (
        (studentAns.selectedOptions && studentAns.selectedOptions.length > 0) ||
        (studentAns.natAnswer !== undefined && studentAns.natAnswer !== null && !isNaN(studentAns.natAnswer))
      );

      if (isAnswered) {
        if (evaluation.isCorrect) correctCount++;
        else incorrectCount++;
      } else {
        unattemptedCount++;
      }

      const timeSpent = studentAns?.timeSpentSeconds || 0;
      totalTimeSpent += timeSpent;

      evaluatedAnswers.push({
        questionId: qDoc._id,
        selectedOptions: studentAns?.selectedOptions || [],
        natAnswer: studentAns?.natAnswer,
        status: studentAns?.status || 'NOT_ANSWERED',
        isCorrect: evaluation.isCorrect,
        marksAwarded: evaluation.marksAwarded,
        negativeMarksDeducted: evaluation.negativeMarksDeducted,
        timeSpentSeconds: timeSpent,
      });

      // Update User Question History for No-Repeat engine
      await UserQuestionHistory.findOneAndUpdate(
        { userId: req.user._id, questionId: qDoc._id },
        {
          $set: {
            branchId: test.branchId,
            subjectId: qDoc.subjectId?._id || qDoc.subjectId,
            topicId: qDoc.topicId?._id || qDoc.topicId,
            lastAttemptedAt: new Date(),
            lastTestId: test._id,
            lastScoreAwarded: markNet,
          },
          $inc: {
            attemptCount: 1,
            correctCount: evaluation.isCorrect ? 1 : 0,
            incorrectCount: (!evaluation.isCorrect && isAnswered) ? 1 : 0,
          },
        },
        { upsert: true, new: true }
      );

      // Aggregate Subject Stats
      const subIdStr = (qDoc.subjectId?._id || qDoc.subjectId).toString();
      const subName = qDoc.subjectId?.name || 'General';
      if (!subjectStatsMap.has(subIdStr)) {
        subjectStatsMap.set(subIdStr, {
          subjectId: qDoc.subjectId?._id || qDoc.subjectId,
          subjectName: subName,
          totalMarks: 0,
          obtainedMarks: 0,
          correctCount: 0,
          incorrectCount: 0,
          unattemptedCount: 0,
        });
      }
      const subStat = subjectStatsMap.get(subIdStr);
      subStat.totalMarks += qDoc.marks;
      subStat.obtainedMarks += markNet;
      if (isAnswered) {
        if (evaluation.isCorrect) subStat.correctCount++;
        else subStat.incorrectCount++;
      } else {
        subStat.unattemptedCount++;
      }

      // Aggregate Topic Stats
      const topIdStr = (qDoc.topicId?._id || qDoc.topicId).toString();
      const topName = qDoc.topicId?.name || 'General';
      if (!topicStatsMap.has(topIdStr)) {
        topicStatsMap.set(topIdStr, {
          topicId: qDoc.topicId?._id || qDoc.topicId,
          topicName: topName,
          subjectId: qDoc.subjectId?._id || qDoc.subjectId,
          totalMarks: 0,
          obtainedMarks: 0,
          correctCount: 0,
          incorrectCount: 0,
          unattemptedCount: 0,
        });
      }
      const topStat = topicStatsMap.get(topIdStr);
      topStat.totalMarks += qDoc.marks;
      topStat.obtainedMarks += markNet;
      if (isAnswered) {
        if (evaluation.isCorrect) topStat.correctCount++;
        else topStat.incorrectCount++;
      } else {
        topStat.unattemptedCount++;
      }
    }

    const attemptedTotal = correctCount + incorrectCount;
    const accuracy = attemptedTotal > 0 ? (correctCount / attemptedTotal) * 100 : 0;

    // Convert stats maps to arrays
    const subjectWiseScores = Array.from(subjectStatsMap.values()).map((s) => ({
      ...s,
      obtainedMarks: Math.max(0, Math.round(s.obtainedMarks * 100) / 100),
      accuracy: s.correctCount + s.incorrectCount > 0 ? Math.round((s.correctCount / (s.correctCount + s.incorrectCount)) * 100) : 0,
    }));

    const topicWiseScores = Array.from(topicStatsMap.values()).map((t) => ({
      ...t,
      obtainedMarks: Math.max(0, Math.round(t.obtainedMarks * 100) / 100),
      accuracy: t.correctCount + t.incorrectCount > 0 ? Math.round((t.correctCount / (t.correctCount + t.incorrectCount)) * 100) : 0,
    }));

    // Update Attempt Document
    attempt.answers = evaluatedAnswers;
    attempt.totalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    attempt.totalMarks = test.totalMarks;
    attempt.accuracy = Math.round(accuracy * 10) / 10;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unattemptedCount = unattemptedCount;
    attempt.timeTakenSeconds = totalTimeSpent;
    attempt.subjectWiseScores = subjectWiseScores;
    attempt.topicWiseScores = topicWiseScores;
    attempt.submittedAt = new Date();
    await attempt.save();

    // Mark test as completed
    test.status = 'completed';
    test.completedAt = new Date();
    await test.save();

    res.json({
      success: true,
      message: 'Test submitted and evaluated successfully',
      data: {
        attemptId: attempt._id,
        testId: test._id,
        totalScore: attempt.totalScore,
        totalMarks: attempt.totalMarks,
        accuracy: attempt.accuracy,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unattemptedCount: attempt.unattemptedCount,
        timeTakenSeconds: attempt.timeTakenSeconds,
        subjectWiseScores: attempt.subjectWiseScores,
        topicWiseScores: attempt.topicWiseScores,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTestResult = async (req, res, next) => {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId)
      .populate('branchId', 'name code')
      .populate('selectedSubjects', 'name category')
      .populate('selectedTopics', 'name');

    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const attempt = await TestAttempt.findOne({ testId, userId: req.user._id })
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer questionType marks negativeMarks explanation year paper subjectId topicId difficulty',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'topicId', select: 'name' },
        ],
      });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Result not found for this test' });
    }

    res.json({
      success: true,
      data: {
        test,
        attempt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTestHistory = async (req, res, next) => {
  try {
    const attempts = await TestAttempt.find({ userId: req.user._id })
      .populate('testId', 'title testType totalMarks durationMinutes createdAt')
      .populate('branchId', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    next(error);
  }
};
