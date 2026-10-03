import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { HypothesisProvider, useHypothesis } from './context/HypothesisContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import HypothesisTest from './pages/HypothesisTest';
import StepByStep from './pages/StepByStep';
import Visualizations from './pages/Visualizations';
import ErrorTypes from './pages/ErrorTypes';
import LearnStatistics from './pages/LearnStatistics';
import AboutProject from './pages/AboutProject';
import {
  Menu,
  GraduationCap,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

function TopNavbar({ onMenuClick }) {
  const { testResult, claimedMean, significanceLevel, resetData } = useHypothesis();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md bg-white/95">
      <div className="flex items-center space-x-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-900 text-white font-bold lg:hidden">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight leading-tight">
              Student Performance Hypothesis Testing System
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Module VII: Testing of Hypothesis – I (One-Sample t-Test)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Status / Reset in Header */}
      <div className="flex items-center space-x-3">
        {testResult && !testResult.isZeroVariance && (
          <div className="hidden sm:flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-mono">μ₀ = {claimedMean}</span>
            <span className="text-slate-300">|</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-semibold border flex items-center space-x-1 ${
                testResult.isReject
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {testResult.isReject ? (
                <XCircle className="w-3 h-3 text-rose-600 inline" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
              )}
              <span>{testResult.decision}</span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={resetData}
          title="Reset dataset to original default values"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Reset Defaults</span>
        </button>
      </div>
    </header>
  );
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hypothesis-test" element={<HypothesisTest />} />
            <Route path="/step-by-step" element={<StepByStep />} />
            <Route path="/visualizations" element={<Visualizations />} />
            <Route path="/error-types" element={<ErrorTypes />} />
            <Route path="/learn-statistics" element={<LearnStatistics />} />
            <Route path="/learn" element={<Navigate to="/learn-statistics" replace />} />
            <Route path="/about-project" element={<AboutProject />} />
            <Route path="/about" element={<Navigate to="/about-project" replace />} />
            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
          <p>
            Student Performance Hypothesis Testing System &copy; {new Date().getFullYear()} &bull; B.Tech Mathematics Project &bull; Module VII: Testing of Hypothesis – I
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HypothesisProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </HypothesisProvider>
  );
}
