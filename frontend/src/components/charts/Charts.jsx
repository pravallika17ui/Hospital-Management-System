import React, { useState } from 'react';

// Responsive SVG Area/Line Chart for Monthly Hospital Revenue
export const MonthlyRevenueChart = ({ data = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        No revenue data recorded for this period.
      </div>
    );
  }

  const values = data.map(d => parseFloat(d.revenue) || 0);
  const maxVal = Math.max(...values, 1000);
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 40;

  // Compute points
  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (chartWidth - padding * 2);
    const val = parseFloat(d.revenue) || 0;
    const y = chartHeight - padding - (val / maxVal) * (chartHeight - padding * 2);
    return { x, y, label: d.month, value: val };
  });

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x},${chartHeight - padding} L ${points[0].x},${chartHeight - padding} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 overflow-visible">
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                ₹{Math.round((ratio * maxVal) / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#revenueGrad)" />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 6 : 4}
              className="fill-white stroke-brand-600 stroke-2 transition-all"
            />
            {/* X-axis labels */}
            <text x={pt.x} y={chartHeight - padding + 16} textAnchor="middle" fontSize="11" fill="#64748b" className="font-medium">
              {pt.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Hover Tooltip */}
      {hoveredIdx !== null && (
        <div 
          className="absolute bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(points[hoveredIdx].x / chartWidth) * 100}%`,
            top: `${(points[hoveredIdx].y / chartHeight) * 100}%`,
            marginTop: '-10px'
          }}
        >
          <div className="font-semibold">{points[hoveredIdx].label}</div>
          <div className="text-brand-300 font-bold">₹{points[hoveredIdx].value.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};

// Responsive SVG Bar Chart for Monthly Appointments
export const MonthlyAppointmentsBarChart = ({ data = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        No appointment volume recorded yet.
      </div>
    );
  }

  const values = data.map(d => parseInt(d.count, 10) || 0);
  const maxVal = Math.max(...values, 5);
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 35;
  const barWidth = 28;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={padding - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {Math.round(ratio * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const count = parseInt(d.count, 10) || 0;
          const barHeight = (count / maxVal) * (chartHeight - padding * 2);
          const x = padding + (i / Math.max(data.length, 1)) * (chartWidth - padding * 2) + 12;
          const y = chartHeight - padding - barHeight;

          const isHovered = hoveredIdx === i;

          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 3)}
                rx="6"
                className={`transition-all duration-200 ${isHovered ? 'fill-brand-500' : 'fill-brand-600/80'}`}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - padding + 16}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
                className="font-medium"
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredIdx !== null && (
        <div 
          className="absolute bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${((padding + (hoveredIdx / data.length) * (chartWidth - padding * 2) + 26) / chartWidth) * 100}%`,
            top: '30%'
          }}
        >
          {data[hoveredIdx].count} appointments
        </div>
      )}
    </div>
  );
};

// Department Specialization Distribution List
export const SpecialtyDistribution = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div className="text-sm text-slate-400">No department statistics available.</div>;
  }

  const total = data.reduce((acc, curr) => acc + (parseInt(curr.appointment_count, 10) || 0), 0) || 1;
  const colors = ['bg-brand-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];

  return (
    <div className="space-y-3.5">
      {data.map((item, idx) => {
        const count = parseInt(item.appointment_count, 10) || 0;
        const percentage = Math.round((count / total) * 100);
        const color = colors[idx % colors.length];

        return (
          <div key={idx}>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">{item.specialization}</span>
              <span className="text-slate-500">{count} visits ({percentage}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${color} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
