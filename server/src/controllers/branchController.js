import { Branch } from '../models/Branch.js';
import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';
import { Question } from '../models/Question.js';

export const getAllBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    next(error);
  }
};

export const getBranchDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    const subjects = await Subject.find({ branchId: id, isActive: true }).sort({ order: 1, name: 1 });
    const topics = await Topic.find({ branchId: id, isActive: true }).sort({ order: 1, name: 1 });
    const questionCount = await Question.countDocuments({ branchId: id, verified: true });

    // Group topics under their subjects
    const subjectsWithTopics = subjects.map((subject) => {
      const subjectObj = subject.toObject();
      subjectObj.topics = topics.filter((t) => t.subjectId.toString() === subject._id.toString());
      return subjectObj;
    });

    res.json({
      success: true,
      data: {
        branch,
        questionCount,
        subjects: subjectsWithTopics,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const { name, code, description, icon } = req.body;
    const branch = await Branch.create({ name, code, description, icon });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, message: 'Branch deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
