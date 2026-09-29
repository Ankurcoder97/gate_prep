import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';

export class ClassificationService {
  /**
   * Classifies a question text into appropriate Subject and Topic based on taxonomy and keyword density
   */
  static async classifyQuestion(questionText, branchId, options = [], hints = {}) {
    const fullText = (
      questionText + ' ' + options.map((o) => (typeof o === 'string' ? o : o.text || '')).join(' ')
    ).toLowerCase();

    // Fetch all active subjects and topics for this branch
    let subjects = await Subject.find({ branchId, isActive: true }).lean();
    let topics = await Topic.find({ branchId, isActive: true }).lean();

    // Fallback if this specific branch has no custom subjects yet: look up global active subjects
    if (!subjects.length || !topics.length) {
      subjects = await Subject.find({ isActive: true }).lean();
      topics = await Topic.find({ isActive: true }).lean();
    }

    if (!subjects.length || !topics.length) {
      // Create a foundational subject & topic on the fly to guarantee schema integrity
      let fallbackSub = await Subject.findOne({ branchId });
      if (!fallbackSub) {
        fallbackSub = await Subject.create({
          name: 'General Engineering & Aptitude',
          code: 'GEN-ENG',
          branchId,
          category: 'Core',
          weightageDefault: 100,
          description: 'Core engineering and assessment syllabus',
          order: 1,
        });
      }
      let fallbackTop = await Topic.findOne({ subjectId: fallbackSub._id });
      if (!fallbackTop) {
        fallbackTop = await Topic.create({
          name: 'General Core Questions',
          code: 'GEN-TOPIC',
          subjectId: fallbackSub._id,
          branchId,
          description: 'General core assessment questions',
          subtopics: ['Core'],
          keywords: ['general', 'engineering'],
          order: 1,
        });
      }
      return {
        subjectId: fallbackSub._id,
        topicId: fallbackTop._id,
        confidence: 50,
        subtopic: 'General',
        difficulty: 'medium',
      };
    }

    // Direct Subject Hint matching if provided (e.g. from structured question parser)
    if (hints && hints.subjectName) {
      const targetSub = subjects.find(
        (s) =>
          s.name.toLowerCase() === hints.subjectName.toLowerCase() ||
          s.code.toLowerCase() === hints.subjectName.toLowerCase() ||
          s.name.toLowerCase().includes(hints.subjectName.toLowerCase()) ||
          hints.subjectName.toLowerCase().includes(s.name.toLowerCase())
      );
      if (targetSub) {
        let matchedTopic = null;
        if (hints.topicName) {
          matchedTopic = topics.find(
            (t) =>
              t.subjectId.toString() === targetSub._id.toString() &&
              (t.name.toLowerCase().includes(hints.topicName.toLowerCase()) ||
                hints.topicName.toLowerCase().includes(t.name.toLowerCase()))
          );
        }
        if (!matchedTopic) {
          matchedTopic = topics.find((t) => t.subjectId.toString() === targetSub._id.toString());
        }

        return {
          subjectId: targetSub._id,
          topicId: matchedTopic ? matchedTopic._id : (topics[0] ? topics[0]._id : null),
          confidence: 95,
          subtopic: hints.subtopic || (matchedTopic ? (matchedTopic.subtopics?.[0] || '') : ''),
          difficulty: hints.difficulty || 'medium',
        };
      }
    }

    // 1. Topic Keyword Scoring
    let bestTopic = null;
    let highestScore = 0;

    for (const topic of topics) {
      let score = 0;
      const topicNameLower = topic.name.toLowerCase();

      // Direct topic name match
      if (fullText.includes(topicNameLower)) {
        score += 15;
      }

      // Keywords score
      if (topic.keywords && topic.keywords.length > 0) {
        for (const kw of topic.keywords) {
          if (fullText.includes(kw.toLowerCase())) {
            score += 6;
          }
        }
      }

      // Subtopics score
      if (topic.subtopics && topic.subtopics.length > 0) {
        for (const sub of topic.subtopics) {
          if (fullText.includes(sub.toLowerCase())) {
            score += 8;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestTopic = topic;
      }
    }

    let matchedSubjectId = null;
    let matchedTopicId = null;
    let confidence = 0;

    if (bestTopic && highestScore >= 6) {
      matchedTopicId = bestTopic._id;
      matchedSubjectId = bestTopic.subjectId;
      confidence = Math.min(100, Math.round((highestScore / 25) * 100));
    } else {
      // Fallback: Subject-level keyword matching
      let bestSubject = null;
      let subjectScore = 0;

      for (const subject of subjects) {
        let sScore = 0;
        const sNameLower = subject.name.toLowerCase();
        if (fullText.includes(sNameLower)) sScore += 10;

        // Specific GATE Subject Heuristics
        if (subject.category === 'General Aptitude' || sNameLower.includes('general aptitude')) {
          if (
            fullText.includes('passage') ||
            fullText.includes('grammatically') ||
            fullText.includes('ratio') ||
            fullText.includes('percentage') ||
            fullText.includes('speed') ||
            fullText.includes('analogy') ||
            fullText.includes('conclude') ||
            fullText.includes('opposite in meaning') ||
            fullText.includes('author') ||
            fullText.includes('synonym') ||
            fullText.includes('antonym') ||
            fullText.includes('undertakes to build') ||
            fullText.includes('unbiased coin') ||
            fullText.includes('missing number in the sequence') ||
            fullText.includes('circular table')
          ) {
            sScore += 12;
          }
        } else if (sNameLower.includes('theory of computation')) {
          if (
            fullText.includes('dfa') ||
            fullText.includes('nfa') ||
            fullText.includes('turing') ||
            fullText.includes('regular language') ||
            fullText.includes('cfg') ||
            fullText.includes('pda') ||
            fullText.includes('decidable') ||
            fullText.includes('chomsky') ||
            fullText.includes('context-free') ||
            fullText.includes('automata')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('database')) {
          if (
            fullText.includes('sql') ||
            fullText.includes('relational') ||
            fullText.includes('functional dependency') ||
            fullText.includes('serializable') ||
            fullText.includes('b+ tree') ||
            fullText.includes('transaction') ||
            fullText.includes('acid') ||
            fullText.includes('foreign key') ||
            fullText.includes('select ') ||
            fullText.includes('from ')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('operating system')) {
          if (
            fullText.includes('deadlock') ||
            fullText.includes('semaphore') ||
            fullText.includes('page replacement') ||
            fullText.includes('round robin') ||
            fullText.includes('virtual memory') ||
            fullText.includes('fork()') ||
            fullText.includes('banker') ||
            fullText.includes('mutex') ||
            fullText.includes('lru') ||
            fullText.includes('thrashing')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('algorithm')) {
          if (
            fullText.includes('time complexity') ||
            fullText.includes('dijkstra') ||
            fullText.includes('dynamic programming') ||
            fullText.includes('recurrence') ||
            fullText.includes('asymptotic') ||
            fullText.includes('hashing') ||
            fullText.includes('greedy') ||
            fullText.includes('bellman') ||
            fullText.includes('minimum spanning tree') ||
            fullText.includes('kruskal') ||
            fullText.includes('prims') ||
            fullText.includes('quicksort') ||
            fullText.includes('mergesort')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('programming') || sNameLower.includes('data structure')) {
          if (
            fullText.includes('binary search tree') ||
            fullText.includes('linked list') ||
            fullText.includes('pointer') ||
            fullText.includes('array') ||
            fullText.includes('stack') ||
            fullText.includes('queue') ||
            fullText.includes('recursion') ||
            fullText.includes('avl tree') ||
            fullText.includes('heap') ||
            fullText.includes('inorder') ||
            fullText.includes('preorder') ||
            fullText.includes('postorder') ||
            fullText.includes('struct ') ||
            fullText.includes('int main') ||
            fullText.includes('printf')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('computer network')) {
          if (
            fullText.includes('tcp') ||
            fullText.includes('ip address') ||
            fullText.includes('subnet') ||
            fullText.includes('sliding window') ||
            fullText.includes('router') ||
            fullText.includes('congestion') ||
            fullText.includes('ethernet') ||
            fullText.includes('dns') ||
            fullText.includes('udp') ||
            fullText.includes('gbn') ||
            fullText.includes('selective repeat') ||
            fullText.includes('crc')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('compiler')) {
          if (
            fullText.includes('parse') ||
            fullText.includes('grammar') ||
            fullText.includes('lexical') ||
            fullText.includes('ll(1)') ||
            fullText.includes('lr(0)') ||
            fullText.includes('slr') ||
            fullText.includes('lalr') ||
            fullText.includes('intermediate code') ||
            fullText.includes('three address') ||
            fullText.includes('first and follow') ||
            fullText.includes('dag')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('computer organization') || sNameLower.includes('architecture')) {
          if (
            fullText.includes('pipeline') ||
            fullText.includes('cache') ||
            fullText.includes('instruction cycle') ||
            fullText.includes('hazard') ||
            fullText.includes('direct mapped') ||
            fullText.includes('set associative') ||
            fullText.includes('addressing mode') ||
            fullText.includes('interrupt') ||
            fullText.includes('microprogram')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('digital logic')) {
          if (
            fullText.includes('k-map') ||
            fullText.includes('multiplexer') ||
            fullText.includes('flip flop') ||
            fullText.includes('boolean algebra') ||
            fullText.includes('decoder') ||
            fullText.includes('counter') ||
            fullText.includes('adder') ||
            fullText.includes('twos complement') ||
            fullText.includes('logic gate')
          ) {
            sScore += 14;
          }
        } else if (sNameLower.includes('engineering mathematics') || sNameLower.includes('discrete')) {
          if (
            fullText.includes('matrix') ||
            fullText.includes('eigenvalue') ||
            fullText.includes('probability') ||
            fullText.includes('differential equation') ||
            fullText.includes('calculus') ||
            fullText.includes('graph theory') ||
            fullText.includes('discrete') ||
            fullText.includes('poisson') ||
            fullText.includes('bayes') ||
            fullText.includes('determinant') ||
            fullText.includes('rank of matrix') ||
            fullText.includes('propositional logic')
          ) {
            sScore += 14;
          }
        }

        if (sScore > subjectScore) {
          subjectScore = sScore;
          bestSubject = subject;
        }
      }

      if (bestSubject) {
        matchedSubjectId = bestSubject._id;
        // Find first or most relevant topic in this subject
        const subjectTopics = topics.filter((t) => t.subjectId.toString() === bestSubject._id.toString());
        if (subjectTopics.length > 0) {
          matchedTopicId = subjectTopics[0]._id;
        }
        confidence = Math.min(80, subjectScore * 6);
      } else {
        // Default to first subject & topic if completely ambiguous
        matchedSubjectId = subjects[0]._id;
        const subTopics = topics.filter((t) => t.subjectId.toString() === subjects[0]._id.toString());
        matchedTopicId = subTopics.length ? subTopics[0]._id : topics[0]._id;
        confidence = 20;
      }
    }

    // Difficulty estimation based on text length, formulas, and concepts
    let difficulty = 'medium';
    if (fullText.length < 120 && !fullText.includes('consider') && !fullText.includes('let')) {
      difficulty = 'easy';
    } else if (fullText.length > 350 || fullText.includes('which of the following are true') || fullText.includes('minimum number of')) {
      difficulty = 'hard';
    }

    return {
      subjectId: matchedSubjectId,
      topicId: matchedTopicId,
      confidence,
      subtopic: bestTopic ? (bestTopic.subtopics?.[0] || '') : '',
      difficulty,
    };
  }
}
