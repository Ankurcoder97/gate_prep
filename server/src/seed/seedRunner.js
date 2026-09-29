import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User.js';
import { Branch } from '../models/Branch.js';
import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';
import { Question } from '../models/Question.js';
import { Blueprint } from '../models/Blueprint.js';
import { DeduplicationService } from '../services/deduplicationService.js';
import { getSeedBranches, getSeedSubjectsAndTopics, getSeedQuestions } from './seedContent.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Initializing database seeding...');

    // 1. Create or verify Default Users
    let admin = await User.findOne({ email: 'admin@gate.io' });
    if (!admin) {
      admin = await User.create({
        name: 'GATE Exam Administrator',
        email: 'admin@gate.io',
        password: 'admin123',
        role: 'admin',
        targetYear: 2026,
      });
      console.log('[Seeder] Admin user created (admin@gate.io / admin123)');
    }

    let student = await User.findOne({ email: 'student@gate.io' });
    if (!student) {
      student = await User.create({
        name: 'Ankur Sharma (GATE Aspirant)',
        email: 'student@gate.io',
        password: 'student123',
        role: 'user',
        targetYear: 2026,
      });
      console.log('[Seeder] Demo student created (student@gate.io / student123)');
    }

    // 2. Seed Branches
    const branchesData = getSeedBranches();
    const branchMap = new Map();

    for (const b of branchesData) {
      let branchDoc = await Branch.findOne({ code: b.code });
      if (!branchDoc) {
        branchDoc = await Branch.create(b);
      }
      branchMap.set(b.code, branchDoc);
    }
    console.log(`[Seeder] Seeded ${branchMap.size} GATE Engineering Branches.`);

    const csBranch = branchMap.get('CS');
    if (admin && !admin.selectedBranch) {
      admin.selectedBranch = csBranch._id;
      await admin.save();
    }
    if (student && !student.selectedBranch) {
      student.selectedBranch = csBranch._id;
      await student.save();
    }

    // 3. Seed Subjects and Topics for CS
    const { subjects, topics } = getSeedSubjectsAndTopics(csBranch._id);
    const subjectMap = new Map();

    for (const sub of subjects) {
      let subDoc = await Subject.findOne({ branchId: csBranch._id, name: sub.name });
      if (!subDoc) {
        subDoc = await Subject.create(sub);
      }
      subjectMap.set(sub.name, subDoc);
    }

    const topicMap = new Map();
    for (const top of topics) {
      const parentSubject = subjectMap.get(top.subjectName);
      if (parentSubject) {
        let topDoc = await Topic.findOne({ subjectId: parentSubject._id, name: top.name });
        if (!topDoc) {
          topDoc = await Topic.create({
            name: top.name,
            code: top.code,
            subjectId: parentSubject._id,
            branchId: csBranch._id,
            description: top.description,
            subtopics: top.subtopics,
            keywords: top.keywords,
            order: top.order,
          });
        }
        topicMap.set(top.name, topDoc);
      }
    }
    console.log(`[Seeder] Seeded ${subjectMap.size} Subjects and ${topicMap.size} Topics for CSE.`);

    // 4. Seed Verified GATE Previous-Year Questions (GATE 2023 - 2026)
    const rawQuestions = getSeedQuestions();
    let seededQCount = 0;

    // Clear old sample questions to ensure fresh clean taxonomy & mark integrity
    await Question.deleteMany({ branchId: csBranch._id, sourceType: 'GATE_PYQ' });

    for (const q of rawQuestions) {
      const parentSubject = subjectMap.get(q.subjectName);
      const parentTopic = topicMap.get(q.topicName);

      if (!parentSubject || !parentTopic) {
        console.warn(`[Seeder Warning] Missing subject/topic for question: ${q.subjectName} -> ${q.topicName}`);
        continue;
      }

      const hash = DeduplicationService.generateHash(q.questionText);
      const normalizedText = DeduplicationService.normalizeText(q.questionText);

      await Question.create({
        branchId: csBranch._id,
        subjectId: parentSubject._id,
        topicId: parentTopic._id,
        subtopic: q.subtopic || '',
        year: q.year,
        paper: q.paper || 'GATE CSE',
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        questionType: q.questionType,
        natRange: q.natRange,
        marks: q.marks,
        negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : (q.questionType === 'MCQ' ? (q.marks === 1 ? 0.33 : 0.66) : 0),
        difficulty: q.difficulty || 'medium',
        explanation: q.explanation,
        sourcePdf: `GATE_${q.year}_CS.pdf`,
        sourceQuestionNumber: q.questionNumber,
        tags: [`GATE ${q.year}`, q.questionType, q.subjectName],
        verified: true,
        verifiedBy: admin._id,
        hash,
        normalizedText,
        sourceType: 'GATE_PYQ',
      });
      seededQCount++;
    }
    console.log(`[Seeder] Seeded and verified ${seededQCount} real GATE PYQ questions into Question Bank.`);

    // 5. Seed Default GATE 100-Mark Blueprint
    const existingBlueprint = await Blueprint.findOne({ branchId: csBranch._id, isDefault: true });
    if (!existingBlueprint) {
      await Blueprint.create({
        name: 'Standard GATE CSE 100-Mark Pattern',
        branchId: csBranch._id,
        yearPattern: 2026,
        totalMarks: 100,
        durationMinutes: 180,
        totalQuestions: 65,
        isDefault: true,
        sections: [
          {
            name: 'General Aptitude (GA)',
            category: 'General Aptitude',
            targetMarks: 15,
            questionDistribution: { oneMarkCount: 5, twoMarkCount: 5 },
            allowedSubjectCategories: ['General Aptitude'],
          },
          {
            name: 'Engineering Mathematics & Core CS',
            category: 'Core',
            targetMarks: 85,
            questionDistribution: { oneMarkCount: 25, twoMarkCount: 30 },
            allowedSubjectCategories: ['Engineering Mathematics', 'Core'],
          },
        ],
      });
      console.log('[Seeder] Standard GATE 100-Mark Blueprint created.');
    }

    console.log('[Seeder] Seeding completed successfully!');
  } catch (error) {
    console.error('[Seeder] Error during database seeding:', error);
  }
};
