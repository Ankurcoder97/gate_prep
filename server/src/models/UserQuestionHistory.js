import mongoose from 'mongoose';

const userQuestionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    attemptCount: {
      type: Number,
      default: 1,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    lastAttemptedAt: {
      type: Date,
      default: Date.now,
    },
    lastTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
    },
    lastScoreAwarded: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userQuestionHistorySchema.index({ userId: 1, questionId: 1 }, { unique: true });
userQuestionHistorySchema.index({ userId: 1, subjectId: 1 });
userQuestionHistorySchema.index({ userId: 1, topicId: 1 });

export const UserQuestionHistory = mongoose.model(
  'UserQuestionHistory',
  userQuestionHistorySchema
);
