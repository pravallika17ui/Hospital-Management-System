import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { MonthlyRevenueChart, MonthlyAppointmentsBarChart, SpecialtyDistribution } from '../../components/charts/Charts';
import {
  Users,
  Stethoscope,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  TrendingUp,
  Receipt,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getAdminStats();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading Hospital Analytics...</span>
        </div>
      </div>
    );
  }

  const { kpis, monthlyAppointments, monthlyRevenue, specializationStats, recentAppointments, recentBills } = data;

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time operational KPI metrics, patient volume, and revenue analytics</p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Patients"
          value={kpis.totalPatients}
          icon={Users}
          color="blue"
          subtitle="Hospital database"
        />
        <StatCard
          title="Active Doctors"
          value={kpis.totalDoctors}
          icon={Stethoscope}
          color="purple"
          subtitle="Across all departments"
        />
        <StatCard
          title="Total Appointments"
          value={kpis.totalAppointments}
          icon={Calendar}
          color="amber"
          change={`${kpis.todayAppointments} scheduled today`}
          changeType="positive"
        />
        <StatCard
          title="Total Realized Revenue"
          value={`₹${kpis.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color="emerald"
          subtitle={`₹${kpis.pendingRevenue.toLocaleString()} pending unpaid`}
        />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Completed Consultations</p>
              <p className="text-lg font-bold text-slate-800">{kpis.completedAppointments}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Treated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Appointments</p>
              <p className="text-lg font-bold text-slate-800">{kpis.pendingAppointments}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Action Req</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-brand-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Today's Appointments</p>
              <p className="text-lg font-bold text-slate-800">{kpis.todayAppointments}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">Today</span>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Monthly Revenue</h3>
              <p className="text-xs text-slate-400">Total collected consultation and procedural bills (₹ INR)</p>
            </div>
            <Link to="/admin/billing" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
              <span>View Invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MonthlyRevenueChart data={monthlyRevenue} />
        </div>

        {/* Specialization Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Department Volume</h3>
            <p className="text-xs text-slate-400">Patient distribution across specialties</p>
          </div>
          <SpecialtyDistribution data={specializationStats} />
        </div>

      </div>

      {/* Appointment Trends & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Appointments Volume Bar Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Appointment Trends</h3>
            <p className="text-xs text-slate-400">Monthly consultation bookings</p>
          </div>
          <MonthlyAppointmentsBarChart data={monthlyAppointments} />
        </div>

        {/* Recent Appointments Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Appointments</h3>
              <p className="text-xs text-slate-400">Latest scheduled patient visits</p>
            </div>
            <Link to="/admin/appointments" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
              <span>All Appointments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Apt #</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Date/Time</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No appointments recorded yet.</td>
                  </tr>
                ) : (
                  recentAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">{apt.appointment_number}</td>
                      <td className="py-3 px-3 font-medium">{apt.patient_name}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{apt.doctor_name}</span>
                        <span className="block text-[10px] text-brand-600">{apt.specialization}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {apt.appointment_date.slice(0, 10)}
                        <span className="block text-[10px]">{apt.appointment_time.slice(0, 5)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge status={apt.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
