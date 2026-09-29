import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, Cpu, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { branchService } from '../services/branchService';

export const AdminBranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [branchDetail, setBranchDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Subject/Topic states
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState('Core');
  const [newTopicName, setNewTopicName] = useState('');
  const [activeSubjectForTopic, setActiveSubjectForTopic] = useState('');

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAllBranches();
      if (res.data?.length) {
        setBranches(res.data);
        if (!selectedBranchId) setSelectedBranchId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchDetail = async (bId) => {
    try {
      const res = await branchService.getBranchDetails(bId);
      if (res.data) setBranchDetail(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchBranchDetail(selectedBranchId);
    }
  }, [selectedBranchId]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      await branchService.createSubject({
        name: newSubjectName,
        branchId: selectedBranchId,
        category: newSubjectCategory,
      });
      setNewSubjectName('');
      fetchBranchDetail(selectedBranchId);
    } catch (err) {
      alert('Failed to add subject');
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !activeSubjectForTopic) return;
    try {
      await branchService.createTopic({
        name: newTopicName,
        subjectId: activeSubjectForTopic,
        branchId: selectedBranchId,
      });
      setNewTopicName('');
      fetchBranchDetail(selectedBranchId);
    } catch (err) {
      alert('Failed to add topic');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Hierarchy Configurator</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Branches, Subjects & Topics
        </h1>
        <p className="text-xs text-slate-500">
          Scale across Computer Science, Electronics, Electrical, Mechanical, and Civil Engineering GATE branches.
        </p>
      </div>

      {/* Branch Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {branches.map((b) => (
          <button
            key={b._id}
            onClick={() => setSelectedBranchId(b._id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedBranchId === b._id
                ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">{b.code}</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{b.name}</div>
          </button>
        ))}
      </div>

      {/* Main Hierarchy Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Subjects & Topics Tree */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Syllabus Structure for {branchDetail?.branch?.name}
            </h3>

            <div className="space-y-3">
              {(branchDetail?.subjects || []).map((sub) => (
                <div key={sub._id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{sub.name}</span>
                      <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {sub.category}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveSubjectForTopic(sub._id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100"
                    >
                      + Add Topic
                    </button>
                  </div>

                  {/* Topics List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    {(sub.topics || []).map((top) => (
                      <div key={top._id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span className="truncate">{top.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Add Panels */}
        <div className="space-y-6">
          
          {/* Add Subject */}
          <form onSubmit={handleAddSubject} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add New Subject</h4>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Subject Name</label>
              <input
                type="text"
                required
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Category</label>
              <select
                value={newSubjectCategory}
                onChange={(e) => setNewSubjectCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Core">Core Subject</option>
                <option value="Engineering Mathematics">Engineering Mathematics</option>
                <option value="General Aptitude">General Aptitude</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Add Subject
            </button>
          </form>

          {/* Add Topic */}
          {activeSubjectForTopic && (
            <form onSubmit={handleAddTopic} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-sm space-y-3 text-xs animate-in fade-in">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add Topic to Subject</h4>
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Search Algorithms"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Save Topic
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubjectForTopic('')}
                  className="px-3 py-2.5 rounded-xl border"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
