import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';

export const getSubjectsByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const subjects = await Subject.find({ branchId, isActive: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, branchId, category, weightageDefault, description } = req.body;
    const subject = await Subject.create({
      name,
      code,
      branchId,
      category,
      weightageDefault,
      description,
    });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject removed successfully' });
  } catch (error) {
    next(error);
  }
};
