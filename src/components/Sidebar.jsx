import React from 'react';
import { NavLink } from 'react-router-dom';
import { useHypothesis } from '../context/HypothesisContext';
import {
  LayoutDashboard,
  Calculator,
  ListOrdered,
  BarChart3,
  AlertTriangle,
  GraduationCap,
  Info,
  BookOpen,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: 'Overview',
  },
  {
    path: '/hypothesis-test',
    label: 'Hypothesis Test',
    icon: Calculator,
    badge: 'Interactive',
  },
  {
    path: '/step-by-step',
    label: 'Step-by-Step Solution',
    icon: ListOrdered,
    badge: '14 Steps',
  },
  {
    path: '/visualizations',
    label: 'Data Visualization',
    icon: BarChart3,
    badge: 'Charts',
  },
  {
    path: '/error-types',
    label: 'Type I & Type II Errors',
    icon: AlertTriangle,
    badge: 'α & β',
  },
  {
    path: '/learn-statistics',
    label: 'Learn Statistics',
    icon: BookOpen,
    badge: 'Guide',
  },
  {
    path: '/about-project',
    label: 'About Project',
    icon: Info,
    badge: 'Module VII',
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { claimedMean, testType } = useHypothesis();

  const methodLabel =
    testType === 'two-tailed'
      ? 'Two-Tailed t-Test'
      : testType === 'right-tailed'
        ? 'Right-Tailed t-Test'
        : 'Left-Tailed t-Test';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-navy-900 text-slate-100 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-800">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                Hypothesis Testing
              </h1>
              <p className="text-xs text-brand-300 font-medium">B.Tech Mathematics VII</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 rounded-lg hover:text-white hover:bg-navy-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Meta Pill */}
        <div className="px-6 py-3.5 bg-navy-950/40 border-b border-navy-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Claim:</span>
            <span className="font-semibold text-emerald-400 font-mono">μ₀ = {claimedMean} Marks</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-400">Method:</span>
            <span className="font-semibold text-brand-300 font-mono">{methodLabel}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/80'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-normal tracking-wide bg-navy-800/80 text-slate-300 border border-navy-700/50"
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/50">
          <div className="rounded-lg bg-navy-800/70 p-3 border border-navy-700/50 text-xs">
            <p className="font-semibold text-slate-200">Course Reference</p>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              Module VII: Testing of Hypothesis – I (One-Sample Mean Test)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
