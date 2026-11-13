import React from 'react';

const badgeStyles = {
  // Appointment / Record Statuses
  Pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  
  // Billing Statuses
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  Unpaid: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  'Partially Paid': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',

  // Account Statuses
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',

  // User Roles
  admin: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
  doctor: 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-500/20',
  patient: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20',
};

export const Badge = ({ status, className = '' }) => {
  const currentStyle = badgeStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 ring-inset ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  );
};

export default Badge;
