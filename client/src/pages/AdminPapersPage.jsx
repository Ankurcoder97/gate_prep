import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Check,
  FileCheck,
  ExternalLink,
  Layers,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { paperService } from '../services/paperService';
import { branchService } from '../services/branchService';

export const AdminPapersPage = () => {
  const [papers, setPapers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});

  // Form State
  const [title, setTitle] = useState('');
  const [branchId, setBranchId] = useState('');
  const [year, setYear] = useState(2026);
  const [session, setSession] = useState('Session 1');
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchAll = async () => {
    try {
      const [papersRes, branchesRes] = await Promise.all([
        paperService.getAllPapers(),
        branchService.getAllBranches(),
      ]);
      if (papersRes.data) setPapers(papersRes.data);
      if (branchesRes.data?.length) {
        setBranches(branchesRes.data);
        if (!branchId) setBranchId(branchesRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // Auto-poll paper ingestion logs every 3.5 seconds
    const interval = setInterval(fetchAll, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.toUpperCase());
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a PDF question paper.');
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('branchId', branchId);
      formData.append('year', year);
      formData.append('session', session);
      formData.append('file', file);

      await paperService.uploadPaper(formData);
      setStatusMessage({
        type: 'success',
        text: `PDF '${file.name}' uploaded successfully! Automated OCR and taxonomy ingestion pipeline is running in background.`,
      });
      setFile(null);
      setTitle('');
      fetchAll();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReprocess = async (pId) => {
    try {
      await paperService.reprocessPaper(pId);
      fetchAll();
    } catch (err) {
      alert('Failed to trigger re-process.');
    }
  };

  const handleDelete = async (pId) => {
    if (!window.confirm('Are you sure you want to delete this paper and its raw metadata?')) return;
    try {
      await paperService.deletePaper(pId);
      fetchAll();
    } catch (err) {
      alert('Failed to delete paper.');
    }
  };

  const toggleLog = (pId) => {
    setExpandedLogs((prev) => ({ ...prev, [pId]: !prev[pId] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-1">
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Automated Paper Ingestion & Document Repository</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          GATE Question Paper Ingestion & PDF Storage
        </h1>
        <p className="text-xs text-slate-500">
          Upload official previous-year GATE PDFs. The ingestion pipeline extracts questions, options, LaTeX mathematical equations, and auto-classifies them into subjects and topics.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Upload Form Box */}
      <form
        onSubmit={handleUploadSubmit}
        className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <span>Upload GATE Question Paper PDF</span>
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-semibold">
            OCR & Direct Stream Supported
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Paper Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GATE 2026 CSE SET 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Target Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Exam Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                <option key={y} value={y}>GATE {y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Session / Set
            </label>
            <input
              type="text"
              placeholder="e.g. Session 1 (Morning)"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Drag & Drop Zone */}
        {!file ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center hover:border-purple-500 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-input"
            />
            <label htmlFor="pdf-input" className="cursor-pointer space-y-3 block">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to select or drag and drop official GATE PDF question paper
                </div>
                <p className="text-xs text-slate-400 mt-1">Supports standard text PDFs & scanned image PDFs up to 50 MB</p>
              </div>
            </label>
          </div>
        ) : (
          /* File Selected & Attached Visual Card */
          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>PDF Attached & Ready</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 break-all">
                  {file.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setFile(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Change PDF
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Ingesting PDF & Synthesizing Questions...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Start Automated PDF Ingestion</span>
            </>
          )}
        </button>
      </form>

      {/* Ingested Papers Pipeline Status List */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-500" />
              <span>Uploaded Papers Repository ({papers.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Every uploaded PDF is cataloged here with live ingestion logs and extracted questions count.
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>

        {papers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs italic">
            No papers uploaded yet. Select and upload your first official GATE PDF above.
          </div>
        ) : (
          <div className="space-y-4">
            {papers.map((p) => {
              const isLogExpanded = !!expandedLogs[p._id];

              return (
                <div
                  key={p._id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left Details */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {p.title}
                          </span>
                          
                          {/* Uploaded Sign Badge */}
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PDF UPLOADED</span>
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                            {p.branchId?.code || 'CS'} • GATE {p.year}
                          </span>

                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              p.status === 'completed'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : p.status === 'error'
                                ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                          <span className="font-mono text-slate-500">File: {p.originalFileName} ({Math.round((p.fileSize || 0) / 1024)} KB)</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {p.totalQuestionsDetected || 0} Questions Parsed
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">
                            {p.extractionSummary?.oneMarkCount || 0} 1M / {p.extractionSummary?.twoMarkCount || 0} 2M
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-2 self-end lg:self-center">
                      <Link
                        to="/admin/questions"
                        className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View Questions</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </Link>

                      <button
                        onClick={() => toggleLog(p._id)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Logs ({p.parsingLogs?.length || 0})</span>
                        {isLogExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleReprocess(p._id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                        title="Reprocess Paper"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Delete Paper"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Processing Logs Drawer */}
                  {isLogExpanded && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] space-y-2 max-h-52 overflow-y-auto animate-in fade-in">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-800">
                        Real-Time Ingestion Logs for {p.originalFileName}
                      </div>
                      {(p.parsingLogs || []).map((log, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span
                            className={`font-bold ${
                              log.status === 'failed'
                                ? 'text-rose-400'
                                : log.status === 'completed'
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}
                          >
                            [{log.step.toUpperCase()}]
                          </span>
                          <span className="text-slate-200">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
