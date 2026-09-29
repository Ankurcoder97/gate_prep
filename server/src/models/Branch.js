import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Branch code is required (e.g. CS, EC, EE)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Cpu', // Lucide icon name
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    defaultDurationMinutes: {
      type: Number,
      default: 180,
    },
  },
  {
    timestamps: true,
  }
);

branchSchema.index({ code: 1, isActive: 1 });

export const Branch = mongoose.model('Branch', branchSchema);
