import React from 'react';
import { Link } from 'react-router-dom';

export default function StatCard({
  title,
  value,
  formula,
  subtitle,
  icon: Icon,
  variant = 'default',
  badge,
  to,
  onClick,
}) {
  const variantStyles = {
    default: {
      card: 'bg-white border-slate-200 text-slate-800 shadow-card',
      iconBox: 'bg-slate-100 text-slate-700',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      valueColor: 'text-slate-900',
    },
    navy: {
      card: 'bg-white border-slate-200 text-slate-800 shadow-card',
      iconBox: 'bg-navy-100 text-navy-800',
      badge: 'bg-navy-50 text-navy-700 border-navy-200',
      valueColor: 'text-navy-950',
    },
    blue: {
      card: 'bg-white border-blue-100 text-slate-800 shadow-card hover:border-brand-300',
      iconBox: 'bg-brand-50 text-brand-600',
      badge: 'bg-brand-50 text-brand-700 border-brand-200',
      valueColor: 'text-brand-700',
    },
    emerald: {
      card: 'bg-white border-emerald-100 text-slate-800 shadow-card hover:border-emerald-300',
      iconBox: 'bg-emerald-50 text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      valueColor: 'text-emerald-700',
    },
    rose: {
      card: 'bg-white border-rose-100 text-slate-800 shadow-card hover:border-rose-300',
      iconBox: 'bg-rose-50 text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      valueColor: 'text-rose-700',
    },
    amber: {
      card: 'bg-white border-amber-100 text-slate-800 shadow-card hover:border-amber-300',
      iconBox: 'bg-amber-50 text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      valueColor: 'text-amber-700',
    },
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;

  const Content = (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl border transition-all duration-200 hover:shadow-elevated ${to || onClick ? 'cursor-pointer' : ''} ${currentStyle.card}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          {formula && (
            <span className="text-[11px] font-mono text-slate-400 block -mt-0.5">
              {formula}
            </span>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg flex items-center justify-center ${currentStyle.iconBox}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className={`text-2xl font-bold tracking-tight font-mono ${currentStyle.valueColor}`}>
          {value}
        </div>
        {badge && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${currentStyle.badge}`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block no-underline">
        {Content}
      </Link>
    );
  }

  return Content;
}
