import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, Clock, Layers, Award } from 'lucide-react';
import { adminService } from '../services/adminService';

export const AdminBlueprintsPage = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getBlueprints().then((res) => {
      if (res.data) setBlueprints(res.data);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>Exam Configuration</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          GATE 100-Mark Exam Blueprints
        </h1>
        <p className="text-xs text-slate-500">
          Official question distribution schemas, section constraints, and negative marking matrices.
        </p>
      </div>

      <div className="space-y-6">
        {blueprints.map((bp) => (
          <div
            key={bp._id}
            className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{bp.name}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    {bp.branchId?.code || 'CS'} • Pattern {bp.yearPattern}
                  </span>
                  {bp.isDefault && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                      Default Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Total {bp.totalMarks} Marks • {bp.totalQuestions} Questions • {bp.durationMinutes} Minutes (3 Hours)
                </p>
              </div>
            </div>

            {/* Sections Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(bp.sections || []).map((sec, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                    <span>{sec.name}</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{sec.targetMarks} Marks</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{sec.category}</span>
                  </p>
                  <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 font-mono">
                    Distribution: {sec.questionDistribution?.oneMarkCount} × 1M + {sec.questionDistribution?.twoMarkCount} × 2M questions
                  </div>
                </div>
              ))}
            </div>

            {/* Marking Penalty Table */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block">MCQ 1-Mark Penalty:</span>
                <span className="font-mono font-bold text-rose-500">-0.33 Marks</span>
              </div>
              <div>
                <span className="text-slate-500 block">MCQ 2-Mark Penalty:</span>
                <span className="font-mono font-bold text-rose-500">-0.66 Marks</span>
              </div>
              <div>
                <span className="text-slate-500 block">MSQ Penalty:</span>
                <span className="font-mono font-bold text-emerald-600">0 Marks (None)</span>
              </div>
              <div>
                <span className="text-slate-500 block">NAT Penalty:</span>
                <span className="font-mono font-bold text-emerald-600">0 Marks (None)</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
