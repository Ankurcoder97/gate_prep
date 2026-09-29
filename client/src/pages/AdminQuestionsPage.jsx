import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Loader2,
  CheckSquare,
  Square,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { questionService } from '../services/questionService';
import { branchService } from '../services/branchService';
import { KaTeXRenderer } from '../components/KaTeXRenderer';

export const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedQIds, setSelectedQIds] = useState([]);

  // Edit Modal
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedBranch) params.branchId = selectedBranch;
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedType) params.questionType = selectedType;
      if (verifiedFilter !== 'all') params.verified = verifiedFilter === 'verified';
      if (search) params.search = search;

      const res = await questionService.getQuestions(params);
      if (res.data) setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    branchService.getAllBranches().then((res) => {
      if (res.data?.length) {
        setBranches(res.data);
        setSelectedBranch(res.data[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      branchService.getSubjectsByBranch(selectedBranch).then((res) => {
        if (res.data) setSubjects(res.data);
      });
      fetchQuestions();
    }
  }, [selectedBranch, selectedSubject, selectedType, verifiedFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleToggleVerify = async (qId, currentVerified) => {
    try {
      await questionService.verifyQuestion(qId, !currentVerified);
      setQuestions((prev) =>
        prev.map((q) => (q._id === qId ? { ...q, verified: !currentVerified } : q))
      );
    } catch (err) {
      alert('Failed to update verification status.');
    }
  };

  const handleBatchVerify = async () => {
    if (selectedQIds.length === 0) return;
    try {
      await questionService.batchVerify(selectedQIds, true);
      setSelectedQIds([]);
      fetchQuestions();
    } catch (err) {
      alert('Failed to batch verify.');
    }
  };

  const handleDelete = async (qId) => {
    if (!window.confirm('Delete this question from question bank?')) return;
    try {
      await questionService.deleteQuestion(qId);
      setQuestions((prev) => prev.filter((q) => q._id !== qId));
    } catch (err) {
      alert('Failed to delete question.');
    }
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setEditForm({
      questionText: q.questionText,
      correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(',') : q.correctAnswer,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await questionService.updateQuestion(editingQuestion._id, editForm);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      alert('Failed to update question.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Question Bank Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            GATE Verified Question Bank
          </h1>
          <p className="text-xs text-slate-500">
            Audit, verify, edit LaTeX mathematical equations, and manage production test questions.
          </p>
        </div>

        {selectedQIds.length > 0 && (
          <button
            onClick={handleBatchVerify}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Selected ({selectedQIds.length})</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.code} ({b.name.split(' ')[0]})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            >
              <option value="">All Types (MCQ, MSQ, NAT)</option>
              <option value="MCQ">MCQ</option>
              <option value="MSQ">MSQ</option>
              <option value="NAT">NAT</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search</label>
            <div className="flex space-x-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Keywords..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button type="submit" className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                Go
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No questions found matching your filter criteria.
          </div>
        ) : (
          questions.map((q) => {
            const isSelected = selectedQIds.includes(q._id);

            return (
              <div
                key={q._id}
                className={`p-6 rounded-3xl border bg-white dark:bg-slate-900 space-y-4 transition-all ${
                  isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedQIds((prev) =>
                          isSelected ? prev.filter((id) => id !== q._id) : [...prev, q._id]
                        );
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                    </button>

                    <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono">
                      {q.questionType} • {q.marks} Mark{q.marks > 1 ? 's' : ''}
                    </span>

                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {q.subjectId?.name}
                    </span>

                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {q.topicId?.name}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      GATE {q.year}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Verification Toggle */}
                    <button
                      onClick={() => handleToggleVerify(q._id, q.verified)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 ${
                        q.verified
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{q.verified ? 'Verified' : 'Unverified (Click to verify)'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(q)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                      title="Edit Question"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(q._id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-slate-100"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm leading-relaxed text-slate-900 dark:text-slate-100">
                  <KaTeXRenderer text={q.questionText} />
                </div>

                {/* Options */}
                {q.options?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-start space-x-2 ${
                          (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.key)) || q.correctAnswer === opt.key
                            ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-bold">({opt.key})</span>
                        <KaTeXRenderer text={opt.text} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Correct Answer Key & Explanation */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-500">Correct Key:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}
                    </span>
                  </div>
                  {q.explanation && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Explanation: </span>
                      <KaTeXRenderer text={q.explanation} />
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Question</h3>
              <button onClick={() => setEditingQuestion(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Question Text (Supports LaTeX $...$)</label>
                <textarea
                  rows={4}
                  value={editForm.questionText}
                  onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Correct Answer (Key or Value)</label>
                  <input
                    type="text"
                    value={editForm.correctAnswer}
                    onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Marks</label>
                  <select
                    value={editForm.marks}
                    onChange={(e) => setEditForm({ ...editForm, marks: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value={1}>1 Mark</option>
                    <option value={2}>2 Marks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Explanation</label>
                <textarea
                  rows={3}
                  value={editForm.explanation}
                  onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl border text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
