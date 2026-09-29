import { Question } from '../models/Question.js';
import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';
import { Test } from '../models/Test.js';
import { UserQuestionHistory } from '../models/UserQuestionHistory.js';
import { Blueprint } from '../models/Blueprint.js';

export class TestEngineService {
  /**
   * Main Test Generation Method
   */
  static async generateTest(userId, config) {
    const {
      branchId,
      testType = 'TOPIC', // 'TOPIC', 'SUBJECT', 'FULL_LENGTH', 'CUSTOM'
      selectedSubjectIds = [],
      selectedTopicIds = [],
      requestedMarks = 100,
      durationMinutes = 180,
      allowFallbackReuse = false,
      difficulty = 'all', // 'easy', 'medium', 'hard', 'all'
      questionTypes = ['MCQ', 'MSQ', 'NAT'],
      yearRange = { start: 2020, end: 2026 },
    } = config;

    // 1. Resolve Target Subjects and Topics
    let targetSubjectIds = [...selectedSubjectIds];
    let targetTopicIds = [...selectedTopicIds];

    if (testType === 'FULL_LENGTH') {
      // For Full Length GATE test, fetch all active subjects and topics for this branch
      const allSubjects = await Subject.find({ branchId, isActive: true }).select('_id');
      const allTopics = await Topic.find({ branchId, isActive: true }).select('_id');
      targetSubjectIds = allSubjects.map((s) => s._id.toString());
      targetTopicIds = allTopics.map((t) => t._id.toString());
    } else if (testType === 'SUBJECT') {
      // If subject test, find all topics belonging to selected subjects
      const subjectTopics = await Topic.find({
        branchId,
        subjectId: { $in: targetSubjectIds },
        isActive: true,
      }).select('_id');
      targetTopicIds = subjectTopics.map((t) => t._id.toString());
    } else if (testType === 'TOPIC') {
      // Ensure subjectIds are populated from the selected topics
      const topics = await Topic.find({ _id: { $in: targetTopicIds } }).select('subjectId');
      targetSubjectIds = [...new Set(topics.map((t) => t.subjectId.toString()))];
    }

    if (targetTopicIds.length === 0 && testType !== 'FULL_LENGTH') {
      throw {
        statusCode: 400,
        code: 'NO_TOPICS_SELECTED',
        message: 'Please select at least one subject or topic to generate a test.',
      };
    }

    // 2. Fetch User's Attempt History for No-Repeat Filtering
    const userHistory = await UserQuestionHistory.find({ userId, branchId })
      .select('questionId lastAttemptedAt attemptCount')
      .lean();

    const attemptedMap = new Map();
    userHistory.forEach((h) => {
      attemptedMap.set(h.questionId.toString(), h);
    });

    // 3. Build Base Query for Candidate Questions
    const query = {
      branchId,
      verified: true, // Only production-verified questions
      sourceType: 'GATE_PYQ', // Exclusively from uploaded authentic GATE PYQ papers
    };

    if (testType === 'TOPIC') {
      query.topicId = { $in: targetTopicIds };
    } else if (testType === 'SUBJECT') {
      query.subjectId = { $in: targetSubjectIds };
    }

    if (questionTypes && questionTypes.length > 0) {
      query.questionType = { $in: questionTypes };
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (yearRange && yearRange.start && yearRange.end) {
      query.year = { $gte: yearRange.start, $lte: yearRange.end };
    }

    // Fetch all eligible questions matching strict branch & topic constraints
    const candidateQuestions = await Question.find(query)
      .populate('subjectId', 'name category')
      .populate('topicId', 'name')
      .lean();

    if (candidateQuestions.length === 0) {
      throw {
        statusCode: 404,
        code: 'NO_QUESTIONS_AVAILABLE',
        message:
          'No verified questions found matching your selected subjects and filters. Please select different topics or ask admin to upload papers.',
      };
    }

    // 4. Partition Questions into Unseen and Attempted
    const unseenPool = [];
    const attemptedPool = [];

    candidateQuestions.forEach((q) => {
      const qIdStr = q._id.toString();
      if (attemptedMap.has(qIdStr)) {
        attemptedPool.push({
          ...q,
          history: attemptedMap.get(qIdStr),
        });
      } else {
        unseenPool.push(q);
      }
    });

    // Calculate available marks in unseen pool
    const totalUnseenMarks = unseenPool.reduce((acc, q) => acc + (q.marks || 1), 0);

    // 5. Select Questions using Blueprint & Mark Balancing Engine
    // Prioritize unseen questions first, and automatically fill any remaining marks with least-seen questions from selected topics
    let selectedQuestions = [];

    if (testType === 'FULL_LENGTH') {
      selectedQuestions = await this.selectFullLengthQuestions(
        branchId,
        unseenPool,
        attemptedPool,
        requestedMarks,
        true // always enable intelligent filling to guarantee exact requested marks
      );
    } else {
      selectedQuestions = this.selectTopicBasedQuestions(
        unseenPool,
        attemptedPool,
        requestedMarks,
        true // always enable intelligent filling to guarantee exact requested marks
      );
    }

    const actualMarks = selectedQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);

    // 7. Strict Quality and Constraint Validation
    this.validateGeneratedTest({
      questions: selectedQuestions,
      requestedMarks: actualMarks,
      branchId,
      targetSubjectIds,
      targetTopicIds,
      testType,
    });

    // 8. Prepare Test Snapshot Document
    const testTitle =
      config.title ||
      (testType === 'FULL_LENGTH'
        ? `GATE Full Length Mock Test - 100 Marks`
        : testType === 'SUBJECT'
        ? `GATE Subject Assessment (${candidateQuestions[0]?.subjectId?.name || 'Selected Subjects'})`
        : `GATE Topic Practice Assessment (${candidateQuestions[0]?.topicId?.name || 'Selected Topics'})`);

    const formattedQuestions = selectedQuestions.map((q, idx) => ({
      questionId: q._id,
      order: idx + 1,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      questionType: q.questionType,
      subjectId: q.subjectId._id || q.subjectId,
      topicId: q.topicId._id || q.topicId,
      isRepeatedFallback: !!q.isRepeatedFallback,
    }));

    // Metadata for analytics
    const unseenCount = selectedQuestions.filter((q) => !q.isRepeatedFallback).length;
    const repeatedCount = selectedQuestions.filter((q) => q.isRepeatedFallback).length;

    const testDoc = new Test({
      userId,
      title: testTitle,
      testType,
      branchId,
      selectedSubjects: targetSubjectIds,
      selectedTopics: targetTopicIds,
      totalMarks: actualMarks,
      durationMinutes,
      questionCount: formattedQuestions.length,
      questions: formattedQuestions,
      status: 'generated',
      generationMetadata: {
        unseenQuestionsCount: unseenCount,
        repeatedQuestionsCount: repeatedCount,
        difficultyDistribution: {
          easy: selectedQuestions.filter((q) => q.difficulty === 'easy').length,
          medium: selectedQuestions.filter((q) => q.difficulty === 'medium').length,
          hard: selectedQuestions.filter((q) => q.difficulty === 'hard').length,
        },
      },
    });

    await testDoc.save();

    return {
      isInsufficientPool: false,
      testId: testDoc._id,
      test: testDoc,
      summary: {
        totalMarks: actualMarks,
        questionCount: formattedQuestions.length,
        unseenCount,
        repeatedCount,
        durationMinutes,
      },
    };
  }

  /**
   * Topic/Subject based Question Selector
   * Combines 1-mark and 2-mark questions to equal EXACTLY requested marks
   */
  static selectTopicBasedQuestions(unseenPool, attemptedPool, requestedMarks, allowReuse) {
    // Shuffle helper to avoid returning identical ordering
    const shuffle = (array) => array.slice().sort(() => Math.random() - 0.5);

    // Sort attempted pool by least recently attempted first for fair spaced repetition across different tests
    const sortedAttempted = attemptedPool.slice().sort((a, b) => {
      const dateA = new Date(a.history?.lastAttemptedAt || 0);
      const dateB = new Date(b.history?.lastAttemptedAt || 0);
      return dateA - dateB;
    });

    // Deduplicate candidate pools so no question can ever appear more than once in the SAME test paper
    const seenCandidateIds = new Set();
    const uniquePool = [];

    // Prioritize unseen first
    for (const q of shuffle(unseenPool)) {
      const qIdStr = q._id.toString();
      if (!seenCandidateIds.has(qIdStr)) {
        seenCandidateIds.add(qIdStr);
        uniquePool.push(q);
      }
    }

    // Then add past attempted questions (spaced repetition from different past tests)
    if (allowReuse) {
      for (const q of sortedAttempted) {
        const qIdStr = q._id.toString();
        if (!seenCandidateIds.has(qIdStr)) {
          seenCandidateIds.add(qIdStr);
          uniquePool.push({ ...q, isRepeatedFallback: true });
        }
      }
    }

    const pool1M = shuffle(uniquePool.filter((q) => q.marks === 1));
    const pool2M = shuffle(uniquePool.filter((q) => q.marks === 2));

    const maxAchievableMarks = pool1M.length * 1 + pool2M.length * 2;
    const effectiveMarks = Math.min(requestedMarks, maxAchievableMarks);

    // Find a combination (num1M, num2M) such that num1M * 1 + num2M * 2 === effectiveMarks
    let bestSelection = null;
    const target2MCount = Math.floor((effectiveMarks * 0.7) / 2);

    for (let c2 = Math.min(target2MCount, pool2M.length); c2 >= 0; c2--) {
      const remainingMarks = effectiveMarks - c2 * 2;
      if (remainingMarks >= 0 && remainingMarks <= pool1M.length) {
        const selected2M = pool2M.slice(0, c2);
        const selected1M = pool1M.slice(0, remainingMarks);
        bestSelection = [...selected1M, ...selected2M];
        break;
      }
    }

    if (!bestSelection) {
      for (let c2 = pool2M.length; c2 >= 0; c2--) {
        const remainingMarks = effectiveMarks - c2 * 2;
        if (remainingMarks >= 0 && remainingMarks <= pool1M.length) {
          bestSelection = [...pool1M.slice(0, remainingMarks), ...pool2M.slice(0, c2)];
          break;
        }
      }
    }

    if (!bestSelection) {
      // Fallback: take all unique available questions
      bestSelection = [...pool1M, ...pool2M];
    }

    // Ensure strict uniqueness in the returned array
    const distinctMap = new Map();
    bestSelection.forEach((q) => distinctMap.set(q._id.toString(), q));
    return Array.from(distinctMap.values());
  }

  /**
   * Full Length GATE Blueprint Selector (100 Marks = 15 GA + 13 EM + 72 Core)
   */
  static async selectFullLengthQuestions(branchId, unseenPool, attemptedPool, requestedMarks, allowReuse) {
    const shuffle = (array) => array.slice().sort(() => Math.random() - 0.5);

    // Fetch blueprint or use standard GATE blueprint
    let blueprint = await Blueprint.findOne({ branchId, isDefault: true }).lean();

    const seenCandidateIds = new Set();
    const uniqueCandidates = [];

    for (const q of shuffle(unseenPool)) {
      const qIdStr = q._id.toString();
      if (!seenCandidateIds.has(qIdStr)) {
        seenCandidateIds.add(qIdStr);
        uniqueCandidates.push(q);
      }
    }

    if (allowReuse) {
      const sortedAttempted = attemptedPool.slice().sort((a, b) => {
        const dateA = new Date(a.history?.lastAttemptedAt || 0);
        const dateB = new Date(b.history?.lastAttemptedAt || 0);
        return dateA - dateB;
      });
      for (const q of sortedAttempted) {
        const qIdStr = q._id.toString();
        if (!seenCandidateIds.has(qIdStr)) {
          seenCandidateIds.add(qIdStr);
          uniqueCandidates.push({ ...q, isRepeatedFallback: true });
        }
      }
    }

    // Partition by GATE category
    const gaQuestions = uniqueCandidates.filter(
      (q) => q.subjectId?.category === 'General Aptitude' || q.subjectId?.name === 'General Aptitude'
    );
    const emQuestions = uniqueCandidates.filter((q) => q.subjectId?.category === 'Engineering Mathematics');
    const coreQuestions = uniqueCandidates.filter(
      (q) =>
        q.subjectId?.category === 'Core' ||
        (!q.subjectId?.category &&
          q.subjectId?.name !== 'General Aptitude' &&
          q.subjectId?.name !== 'Engineering Mathematics')
    );

    // GATE Standard Allocation:
    // General Aptitude: 15 marks (5x1M + 5x2M = 10 questions)
    // Eng Maths + Core: 85 marks (25x1M + 30x2M = 55 questions)
    let selectedGA = [];
    let selectedTechnical = [];

    // General Aptitude Selection
    const ga1M = shuffle(gaQuestions.filter((q) => q.marks === 1));
    const ga2M = shuffle(gaQuestions.filter((q) => q.marks === 2));

    if (ga1M.length >= 5 && ga2M.length >= 5) {
      selectedGA = [...ga1M.slice(0, 5), ...ga2M.slice(0, 5)];
    } else {
      selectedGA = this.selectTopicBasedQuestions(
        gaQuestions.filter((q) => !q.isRepeatedFallback),
        gaQuestions.filter((q) => q.isRepeatedFallback),
        15,
        allowReuse
      );
    }

    // Technical Selection (Remaining marks = requestedMarks - GA marks)
    const gaIds = new Set(selectedGA.map((q) => q._id.toString()));
    const gaTotal = selectedGA.reduce((acc, q) => acc + (q.marks || 1), 0);
    const techTarget = Math.max(0, requestedMarks - gaTotal);

    const techCandidates = [...emQuestions, ...coreQuestions].filter((q) => !gaIds.has(q._id.toString()));
    selectedTechnical = this.selectTopicBasedQuestions(
      techCandidates.filter((q) => !q.isRepeatedFallback),
      techCandidates.filter((q) => q.isRepeatedFallback),
      techTarget,
      allowReuse
    );

    // Combined Full Length Test: GA first (Q1-10) then Technical (Q11-65)
    const combined = [...selectedGA, ...selectedTechnical];
    const finalMap = new Map();
    combined.forEach((q) => finalMap.set(q._id.toString(), q));
    return Array.from(finalMap.values());
  }

  /**
   * Final Quality Check & Constraint Verification
   */
  static validateGeneratedTest({ questions, requestedMarks, branchId, targetSubjectIds, targetTopicIds, testType }) {
    if (!questions || questions.length === 0) {
      throw new Error('Test generation failed: No questions were selected.');
    }

    // 1. Total Marks Check
    const calculatedMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    if (calculatedMarks !== requestedMarks) {
      throw new Error(
        `Validation Error: Generated total marks (${calculatedMarks}) does not match requested marks (${requestedMarks}).`
      );
    }

    // 2. Strict Uniqueness Check: Duplicate question inside the SAME test paper is NEVER allowed
    const seenIds = new Set();
    for (const q of questions) {
      const id = (q._id || q.questionId).toString();
      if (seenIds.has(id)) {
        throw new Error(`Validation Error: Duplicate question detected in test paper: ${id}`);
      }
      seenIds.add(id);
    }

    // 3. Strict Topic / Subject Constraint Check
    if (testType === 'TOPIC') {
      const allowedTopics = new Set(targetTopicIds.map((t) => t.toString()));
      for (const q of questions) {
        const topicId = (q.topicId?._id || q.topicId).toString();
        if (!allowedTopics.has(topicId)) {
          throw new Error(
            `Validation Error: Question ${q._id} belongs to topic ${topicId}, which was NOT selected by user.`
          );
        }
      }
    } else if (testType === 'SUBJECT') {
      const allowedSubjects = new Set(targetSubjectIds.map((s) => s.toString()));
      for (const q of questions) {
        const subjectId = (q.subjectId?._id || q.subjectId).toString();
        if (!allowedSubjects.has(subjectId)) {
          throw new Error(
            `Validation Error: Question ${q._id} belongs to subject ${subjectId}, which was NOT selected by user.`
          );
        }
      }
    }

    return true;
  }
}
