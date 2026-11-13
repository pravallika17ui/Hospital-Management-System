import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', change, changeType = 'positive', subtitle }) => {
  const colorMap = {
    blue: {
      bg: 'bg-brand-50 text-brand-600',
      border: 'border-brand-100',
      gradient: 'from-brand-500/10 to-transparent'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      gradient: 'from-emerald-500/10 to-transparent'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
      gradient: 'from-purple-500/10 to-transparent'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      gradient: 'from-amber-500/10 to-transparent'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      gradient: 'from-rose-500/10 to-transparent'
    }
  };

  const current = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${current.gradient} rounded-bl-full pointer-events-none`} />
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${current.bg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        
        {(change || subtitle) && (
          <div className="flex items-center gap-2 mt-2">
            {change && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                changeType === 'positive' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}>
                {change}
              </span>
            )}
            {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
