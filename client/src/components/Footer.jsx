import React from 'react';
import { GraduationCap, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">GATESphere Assessment</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              A high-precision real-time assessment platform engineered for GATE aspirants. Dynamically generate strict 100-mark tests matching official syllabi, track unseen questions with no-repeat algorithms, and ingest previous years papers.
            </p>
            <div className="flex items-center space-x-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Official PYQs</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>Zero Question Duplication</span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Assessment Modes</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><span className="hover:text-blue-500 cursor-pointer">100-Mark Full Length Mock Test</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Subject-Specific Test</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Granular Topic Practice</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Custom Difficulty Assessment</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Supported Branches</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Computer Science & IT (CS)</li>
              <li>Electronics & Communication (EC)</li>
              <li>Electrical Engineering (EE)</li>
              <li>Mechanical Engineering (ME)</li>
              <li>Civil Engineering (CE)</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} GATESphere Assessment Engine. Built for GATE Excellence.</p>
          <p className="mt-2 sm:mt-0">Strict Exam Blueprint • Verified Solutions • Instant AI Classification</p>
        </div>
      </div>
    </footer>
  );
};
