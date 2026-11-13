import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  CalendarPlus,
  FileText,
  CreditCard,
  UserCheck,
  ClipboardPlus,
  FileHeart,
  Pill,
  Receipt,
  User,
  ShieldCheck,
  LogOut,
  Activity,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ isMobile = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build navigation items based on role
  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Manage Doctors', path: '/admin/doctors', icon: Stethoscope },
        { label: 'Manage Patients', path: '/admin/patients', icon: Users },
        { label: 'All Appointments', path: '/admin/appointments', icon: Calendar },
        { label: 'Medical Records', path: '/admin/records', icon: FileText },
        { label: 'Billing & Invoices', path: '/admin/billing', icon: CreditCard },
        { label: 'System Users', path: '/admin/users', icon: ShieldCheck },
      ];
    }

    if (user.role === 'doctor') {
      return [
        { label: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
        { label: 'My Appointments', path: '/doctor/appointments', icon: Calendar },
        { label: 'Consulted Patients', path: '/doctor/patients', icon: Users },
        { label: 'Add Clinical Record', path: '/doctor/add-record', icon: ClipboardPlus },
        { label: 'Doctor Profile & Hours', path: '/doctor/profile', icon: UserCheck },
      ];
    }

    // Patient
    return [
      { label: 'Patient Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
      { label: 'Book Appointment', path: '/patient/book-appointment', icon: CalendarPlus },
      { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
      { label: 'Medical Records', path: '/patient/records', icon: FileHeart },
      { label: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
      { label: 'Bills & Payments', path: '/patient/bills', icon: Receipt },
      { label: 'Personal Profile', path: '/patient/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Activity className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-lg font-black tracking-tight text-white block leading-tight">
            CarePoint<span className="text-brand-400">.</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300/80 block">
            {user?.role?.toUpperCase()} PORTAL
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold text-xs flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
