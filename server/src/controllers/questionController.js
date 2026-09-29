import { Question } from '../models/Question.js';
import { DeduplicationService } from '../services/deduplicationService.js';

export const getQuestions = async (req, res, next) => {
  try {
    const {
      branchId,
      subjectId,
      topicId,
      year,
      questionType,
      difficulty,
      verified,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (branchId) query.branchId = branchId;
    if (subjectId) query.subjectId = subjectId;
    if (topicId) query.topicId = topicId;
    if (year) query.year = parseInt(year, 10);
    if (questionType) query.questionType = questionType;
    if (difficulty) query.difficulty = difficulty;
    if (verified !== undefined) query.verified = verified === 'true';

    if (search) {
      query.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('branchId', 'name code')
      .populate('subjectId', 'name category')
      .populate('topicId', 'name')
      .sort({ createdAt: -1, questionNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: questions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('branchId', 'name code')
      .populate('subjectId', 'name category')
      .populate('topicId', 'name subtopics');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const data = req.body;
    const hash = DeduplicationService.generateHash(data.questionText);
    const normalizedText = DeduplicationService.normalizeText(data.questionText);

    // Negative marking defaults if not provided
    if (data.negativeMarks === undefined) {
      if (data.questionType === 'MCQ') {
        data.negativeMarks = data.marks === 1 ? 0.33 : 0.66;
      } else {
        data.negativeMarks = 0;
      }
    }

    const question = await Question.create({
      ...data,
      hash,
      normalizedText,
      verified: true, // Manual admin creations default to verified
      verifiedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    if (updates.questionText) {
      updates.hash = DeduplicationService.generateHash(updates.questionText);
      updates.normalizedText = DeduplicationService.normalizeText(updates.questionText);
    }

    const question = await Question.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('subjectId', 'name')
      .populate('topicId', 'name');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

export const verifyQuestion = async (req, res, next) => {
  try {
    const { verified = true } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { verified, verifiedBy: req.user._id },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question, message: `Question ${verified ? 'verified' : 'unverified'} successfully` });
  } catch (error) {
    next(error);
  }
};

export const batchVerify = async (req, res, next) => {
  try {
    const { questionIds, verified = true } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No question IDs provided' });
    }

    const result = await Question.updateMany(
      { _id: { $in: questionIds } },
      { verified, verifiedBy: req.user._id }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} questions updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};
