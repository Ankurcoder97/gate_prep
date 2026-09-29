import { Topic } from '../models/Topic.js';

export const getTopicsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const topics = await Topic.find({ subjectId, isActive: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, count: topics.length, data: topics });
  } catch (error) {
    next(error);
  }
};

export const getTopicsByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const topics = await Topic.find({ branchId, isActive: true }).populate('subjectId', 'name category').sort({ order: 1, name: 1 });
    res.json({ success: true, count: topics.length, data: topics });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req, res, next) => {
  try {
    const { name, code, subjectId, branchId, description, subtopics, keywords } = req.body;
    const topic = await Topic.create({
      name,
      code,
      subjectId,
      branchId,
      description,
      subtopics: subtopics || [],
      keywords: keywords || [],
    });
    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, message: 'Topic removed successfully' });
  } catch (error) {
    next(error);
  }
};
