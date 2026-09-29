import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  BookOpen,
  Layers,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckSquare,
  Square,
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { branchService } from '../services/branchService';
import { testService } from '../services/testService';

export const TestSetupPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'TOPIC';

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const [testType, setTestType] = useState(initialType);
  const [requestedMarks, setRequestedMarks] = useState(100);
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [difficulty, setDifficulty] = useState('all');
  const [questionTypes, setQuestionTypes] = useState(['MCQ', 'MSQ', 'NAT']);
  const [allowFallbackReuse, setAllowFallbackReuse] = useState(false);

  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insufficientPoolData, setInsufficientPoolData] = useState(null);
  const [error, setError] = useState(null);

  // 1. Fetch Branches & Initial Branch Data
  useEffect(() => {
    branchService.getAllBranches().then((res) => {
      if (res.data?.length) {
        setBranches(res.data);
        const defaultBranchId = user?.selectedBranch?._id || user?.selectedBranch || res.data[0]._id;
        setSelectedBranchId(defaultBranchId);
      }
    }).catch(() => {});
  }, [user]);

  // 2. Fetch Subjects and Topics when branch changes
  useEffect(() => {
    if (!selectedBranchId) return;

    setLoadingHierarchy(true);
    setError(null);
    setInsufficientPoolData(null);

    branchService.getBranchDetails(selectedBranchId).then((res) => {
      if (res.data?.subjects) {
        setSubjects(res.data.subjects);
        // Default expand first 2 subjects
        const initialExpanded = {};
        res.data.subjects.slice(0, 3).forEach((s) => {
          initialExpanded[s._id] = true;
        });
        setExpandedSubjects(initialExpanded);

        // Pre-select first subject & topics for instant convenience
        if (testType === 'FULL_LENGTH') {
          handleSelectAll(res.data.subjects);
        } else if (res.data.subjects.length > 0) {
          const firstSub = res.data.subjects[0];
          setSelectedSubjectIds([firstSub._id]);
          setSelectedTopicIds(firstSub.topics?.map((t) => t._id) || []);
        }
      }
    }).catch((err) => {
      setError('Failed to load syllabus topics for selected branch.');
    }).finally(() => {
      setLoadingHierarchy(false);
    });
  }, [selectedBranchId]);

  // Auto-select all when FULL_LENGTH is chosen
  useEffect(() => {
    if (testType === 'FULL_LENGTH' && subjects.length > 0) {
      handleSelectAll(subjects);
      setRequestedMarks(100);
      setDurationMinutes(180);
    }
  }, [testType, subjects]);

  const toggleSubjectExpansion = (subId) => {
    setExpandedSubjects((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const handleSelectAll = (allSubjectsList) => {
    const list = allSubjectsList || subjects;
    const allSubIds = list.map((s) => s._id);
    const allTopicIds = list.flatMap((s) => (s.topics || []).map((t) => t._id));
    setSelectedSubjectIds(allSubIds);
    setSelectedTopicIds(allTopicIds);
  };

  const handleClearAll = () => {
    setSelectedSubjectIds([]);
    setSelectedTopicIds([]);
  };

  const handleToggleSubject = (subject) => {
    const isSelected = selectedSubjectIds.includes(subject._id);
    const subjectTopicIds = (subject.topics || []).map((t) => t._id);

    if (isSelected) {
      setSelectedSubjectIds((prev) => prev.filter((id) => id !== subject._id));
      setSelectedTopicIds((prev) => prev.filter((id) => !subjectTopicIds.includes(id)));
    } else {
      setSelectedSubjectIds((prev) => [...prev, subject._id]);
      setSelectedTopicIds((prev) => [...new Set([...prev, ...subjectTopicIds])]);
    }
  };

  const handleToggleTopic = (topic, parentSubject) => {
    const isSelected = selectedTopicIds.includes(topic._id);
    let updatedTopics;

    if (isSelected) {
      updatedTopics = selectedTopicIds.filter((id) => id !== topic._id);
    } else {
      updatedTopics = [...selectedTopicIds, topic._id];
    }
    setSelectedTopicIds(updatedTopics);

    // If any topic in subject is selected, ensure subject is in selectedSubjectIds
    const subjectTopicIds = (parentSubject.topics || []).map((t) => t._id);
    const hasAnyTopic = subjectTopicIds.some((id) => updatedTopics.includes(id));

    if (hasAnyTopic && !selectedSubjectIds.includes(parentSubject._id)) {
      setSelectedSubjectIds((prev) => [...prev, parentSubject._id]);
    } else if (!hasAnyTopic && selectedSubjectIds.includes(parentSubject._id)) {
      setSelectedSubjectIds((prev) => prev.filter((id) => id !== parentSubject._id));
    }
  };

  const handleGenerate = async (overrideFallback = allowFallbackReuse) => {
    setIsGenerating(true);
    setError(null);
    setInsufficientPoolData(null);

    try {
      const config = {
        branchId: selectedBranchId,
        testType,
        selectedSubjectIds,
        selectedTopicIds,
        requestedMarks: parseInt(requestedMarks, 10),
        durationMinutes: parseInt(durationMinutes, 10),
        difficulty,
        questionTypes,
        allowFallbackReuse: overrideFallback,
      };

      const res = await testService.generateTest(config);

      if (res.code === 'INSUFFICIENT_QUESTION_POOL') {
        setInsufficientPoolData(res.data);
        setIsGenerating(false);
        return;
      }

      if (res.data?.testId) {
        // Start test & navigate to CBT exam interface
        await testService.startTest(res.data.testId);
        navigate(`/tests/${res.data.testId}/live`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate test.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered subjects based on search query
  const filteredSubjects = subjects.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const subMatch = s.name.toLowerCase().includes(q);
    const topicMatch = (s.topics || []).some((t) => t.name.toLowerCase().includes(q));
    return subMatch || topicMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Dynamic Assessment Configurator</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Configure Your GATE Assessment
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select syllabus topics, adjust test parameters, and generate an exact 100-mark assessment with strict topic constraints.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-sm text-rose-700 dark:text-rose-300 font-medium flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}



      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Branch & Subject/Topic Hierarchy Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Branch Selector */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Step 1: Select Branch
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {branches.map((b) => (
                <button
                  key={b._id}
                  onClick={() => setSelectedBranchId(b._id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedBranchId === b._id
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{b.code}</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{b.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Subjects and Topics Tree */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Step 2: Select Syllabus Subjects & Topics
                </label>
                <p className="text-xs text-slate-500">
                  {selectedTopicIds.length} topics selected across {selectedSubjectIds.length} subjects
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSelectAll()}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. Regular Languages, SQL, Deadlocks)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Subjects List */}
            {loadingHierarchy ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs">Loading branch syllabus...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredSubjects.map((subject) => {
                  const isSubjectSelected = selectedSubjectIds.includes(subject._id);
                  const isExpanded = !!expandedSubjects[subject._id];
                  const subjectTopicIds = (subject.topics || []).map((t) => t._id);
                  const selectedInSubject = subjectTopicIds.filter((id) => selectedTopicIds.includes(id)).length;

                  return (
                    <div
                      key={subject._id}
                      className={`rounded-2xl border transition-colors ${
                        isSubjectSelected
                          ? 'border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {/* Subject Row Header */}
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleSubject(subject)}
                            className="p-1 text-blue-600 hover:scale-110 transition-transform"
                          >
                            {isSubjectSelected ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {subject.name}
                            </span>
                            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {selectedInSubject}/{subject.topics?.length || 0} topics
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSubjectExpansion(subject._id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Sub-Topics Collapsible */}
                      {isExpanded && subject.topics?.length > 0 && (
                        <div className="p-3 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {subject.topics.map((topic) => {
                            const isTopicSelected = selectedTopicIds.includes(topic._id);
                            return (
                              <button
                                key={topic._id}
                                onClick={() => handleToggleTopic(topic, subject)}
                                className={`p-2.5 rounded-xl text-left text-xs flex items-start space-x-2 transition-colors ${
                                  isTopicSelected
                                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 font-semibold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="mt-0.5">
                                  {isTopicSelected ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </span>
                                <span className="leading-tight">{topic.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Col: Test Configuration Sidebar */}
        <div className="space-y-6">
          
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 sticky top-24">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Step 3: Test Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTestType('TOPIC')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    testType === 'TOPIC'
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-500 mb-1" />
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Topic Test</div>
                  <div className="text-[10px] text-slate-500">Selected topics only</div>
                </button>

                <button
                  onClick={() => setTestType('FULL_LENGTH')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    testType === 'FULL_LENGTH'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500 mb-1" />
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Full Length</div>
                  <div className="text-[10px] text-slate-500">Exact 100 Marks</div>
                </button>

                <button
                  onClick={() => setTestType('SUBJECT')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    testType === 'SUBJECT'
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-500 mb-1" />
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Subject Test</div>
                  <div className="text-[10px] text-slate-500">Single subject deep dive</div>
                </button>

                <button
                  onClick={() => setTestType('CUSTOM')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    testType === 'CUSTOM'
                      ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/60 ring-1 ring-purple-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-purple-500 mb-1" />
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Custom Test</div>
                  <div className="text-[10px] text-slate-500">Fine-tuned marks</div>
                </button>
              </div>
            </div>

            {/* Total Marks */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Exam Marks
                </label>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                  {requestedMarks} Marks
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[25, 50, 65, 100].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setRequestedMarks(m);
                      setDurationMinutes(m === 100 ? 180 : m === 50 ? 90 : 45);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      requestedMarks === m
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Duration (Minutes)
                </label>
                <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300">
                  {durationMinutes} Min
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={180}
                step={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Question Types Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Question Types
              </label>
              <div className="flex space-x-2">
                {['MCQ', 'MSQ', 'NAT'].map((type) => {
                  const isChecked = questionTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        if (isChecked && questionTypes.length > 1) {
                          setQuestionTypes(questionTypes.filter((t) => t !== type));
                        } else if (!isChecked) {
                          setQuestionTypes([...questionTypes, type]);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isChecked
                          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate CTA Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || selectedTopicIds.length === 0}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Assessment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Generate {requestedMarks}-Mark Test</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              * Engine guarantees exact {requestedMarks} marks, 0 unselected subject questions, and prioritizes unseen questions.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};
