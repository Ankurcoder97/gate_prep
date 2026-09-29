import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  HelpCircle,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  Database,
  Users,
} from 'lucide-react';
import { adminService } from '../services/adminService';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAdminStats().then((res) => {
      if (res.data) setStats(res.data);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading admin system telemetry...</p>
      </div>
    );
  }

  const { summary, questionsByBranch, questionsByType, questionsByMarks } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            GATE Ingestion & Question Bank Operations
          </h1>
          <p className="text-xs text-slate-500">
            Manage paper ingestion pipelines, question verification queues, branches, and blueprints.
          </p>
        </div>

        <Link
          to="/admin/papers"
          className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 flex items-center space-x-1.5 w-fit"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload GATE PDF Paper</span>
        </Link>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Total Question Bank</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{summary?.totalQuestions || 0}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">{summary?.verifiedQuestions || 0} production verified</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Verification Backlog</div>
          <div className="text-3xl font-black text-amber-500 font-mono">{summary?.unverifiedQuestions || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Pending admin review</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Ingested Papers</div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">{summary?.totalPapers || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">PDF papers processed</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold uppercase text-slate-500 mb-1">Tests Generated</div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{summary?.totalTestsGenerated || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">{summary?.totalUsers || 0} registered users</div>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link
          to="/admin/papers"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Paper Ingestion Pipeline</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Upload GATE question PDFs, monitor real-time text parsing, option extraction, and deduplication.
          </p>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-1">
            <span>Manage Papers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/questions"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Question Bank & Verification</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Search, filter by subject/topic/year, edit LaTeX math, correct answers, and approve questions.
          </p>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
            <span>Review Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/branches"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Branches, Subjects & Topics</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Manage flexible engineering branch hierarchy, syllabus categories, and topic keywords.
          </p>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
            <span>Configure Hierarchy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/blueprints"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">100-Mark Blueprints</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Configure official GATE exam distribution (GA 15M + Core 85M) and marking penalties.
          </p>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1">
            <span>View Blueprints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

      </div>

    </div>
  );
};
