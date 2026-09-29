import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  BarChart3,
  Clock,
  Layers,
  ArrowRight,
  Zap,
  BookOpen,
  FileCheck2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-600 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36">
        {/* Background gradient decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Next-Gen GATE Assessment Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
            GATE Preparation, Powered by Real{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Previous-Year Questions.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Practice exactly what you want, track what you've already attempted, and dynamically generate fresh 100-mark assessments whenever you need one.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/generate-test" : "/register"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-105"
            >
              <span>Start Practice Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to={isAuthenticated ? "/generate-test?type=FULL_LENGTH" : "/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base shadow-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Take Full 100-Mark Mock</span>
            </Link>
          </div>

          {/* Key Trust Badges */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Official Verified PYQs</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>Strict Topic Isolation</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Zero Unseen Question Repeats</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Exact 100-Mark Blueprints</span>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Intelligent Pipeline
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered for True GATE Precision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
                Select Branch & Topics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose any combination of subjects or granular topics—like Theory of Computation + General Aptitude. Unselected subjects never leak into your test.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
                Dynamic 100-Mark Engine
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Our constraint-based engine balances 1-mark & 2-mark questions, MCQ, MSQ, and NAT types to match exact exam blueprints with zero duplicate questions.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
                No-Repeat Guarantee
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every attempted question is mapped to your profile history. Generating a test tomorrow on the same topics will prioritize brand new unseen questions.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
                <FileCheck2 className="w-4 h-4" />
                <span>PDF Ingestion Pipeline</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Previous 3-4 Years GATE Papers, Digitized & Structured.
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                Upload raw official GATE question papers. Our automated multi-phase parser extracts text, math equations, diagrams, and options, classifies them by subject taxonomy, and prepares them for assessment.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Deduplication Protection</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">SHA-256 and fuzzy text similarity comparison ensures no duplicate questions enter your assessments.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Admin Verification Workflow</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Every parsed question is tagged for admin verification before entering the production question pool.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Interactive Mock Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-slate-400">GATE CSE 2026 • Question 12</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  MCQ • 2 Marks
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200">
                Consider a relation <span className="font-mono text-cyan-400">R(A, B, C, D)</span> with functional dependencies:
                <br />
                <span className="font-mono text-emerald-400 text-xs mt-1 block">
                  F = &#123; A &rarr; B, B &rarr; C, C &rarr; D, D &rarr; A &#125;
                </span>
                How many candidate keys does the relation R possess?
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono">
                  (A) 1 Candidate Key
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono">
                  (B) 2 Candidate Keys
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono">
                  (C) 3 Candidate Keys
                </div>
                <div className="p-2.5 rounded-lg bg-blue-600/30 border border-blue-500 text-xs font-mono text-blue-300 font-bold">
                  (D) 4 Candidate Keys ✓
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
