import { User } from '../models/User.js';
import { Branch } from '../models/Branch.js';
import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';
import { Question } from '../models/Question.js';
import { Paper } from '../models/Paper.js';
import { Test } from '../models/Test.js';
import { Blueprint } from '../models/Blueprint.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBranches = await Branch.countDocuments({ isActive: true });
    const totalSubjects = await Subject.countDocuments({ isActive: true });
    const totalTopics = await Topic.countDocuments({ isActive: true });
    const totalQuestions = await Question.countDocuments();
    const verifiedQuestions = await Question.countDocuments({ verified: true });
    const unverifiedQuestions = await Question.countDocuments({ verified: false });
    const totalPapers = await Paper.countDocuments();
    const totalTestsGenerated = await Test.countDocuments();

    // Group questions by branch
    const questionsByBranch = await Question.aggregate([
      {
        $group: {
          _id: '$branchId',
          total: { $sum: 1 },
          verified: { $sum: { $cond: ['$verified', 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      {
        $unwind: '$branch',
      },
      {
        $project: {
          branchName: '$branch.name',
          branchCode: '$branch.code',
          total: 1,
          verified: 1,
        },
      },
    ]);

    // Questions by type
    const questionsByType = await Question.aggregate([
      { $group: { _id: '$questionType', count: { $sum: 1 } } },
    ]);

    // Questions by marks
    const questionsByMarks = await Question.aggregate([
      { $group: { _id: '$marks', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalBranches,
          totalSubjects,
          totalTopics,
          totalQuestions,
          verifiedQuestions,
          unverifiedQuestions,
          totalPapers,
          totalTestsGenerated,
        },
        questionsByBranch,
        questionsByType,
        questionsByMarks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBlueprints = async (req, res, next) => {
  try {
    const blueprints = await Blueprint.find().populate('branchId', 'name code');
    res.json({ success: true, count: blueprints.length, data: blueprints });
  } catch (error) {
    next(error);
  }
};

export const createBlueprint = async (req, res, next) => {
  try {
    const blueprint = await Blueprint.create(req.body);
    res.status(201).json({ success: true, data: blueprint });
  } catch (error) {
    next(error);
  }
};
