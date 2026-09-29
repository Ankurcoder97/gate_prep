import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Subject must belong to a branch'],
      index: true,
    },
    category: {
      type: String,
      enum: ['General Aptitude', 'Engineering Mathematics', 'Core'],
      default: 'Core',
      index: true,
    },
    weightageDefault: {
      type: Number, // Typical weightage percentage (e.g., 15 for Aptitude, 13 for Maths, etc.)
      default: 10,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ branchId: 1, name: 1 }, { unique: true });

export const Subject = mongoose.model('Subject', subjectSchema);
