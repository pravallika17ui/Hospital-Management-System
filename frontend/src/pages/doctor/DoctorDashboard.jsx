import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Calendar, Users, CheckCircle2, Clock, ClipboardPlus, ArrowRight, Activity } from 'lucide-react';

export const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getDoctorStats();
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { kpis, todaySchedule } = data;

  return (
    <div className="space-y-8">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-brand-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-brand-200">Doctor Clinical Desk</span>
          <h1 className="text-2xl sm:text-3xl font-black">Good day, Doctor</h1>
          <p className="text-brand-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            You have {kpis.todayAppointments} patient consultations scheduled for today. Remember to document clinical notes and e-prescriptions following each visit.
          </p>
        </div>
        <Link
          to="/doctor/add-record"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-700 font-bold text-xs shadow-md hover:bg-brand-50 transition-colors flex-shrink-0 self-start"
        >
          <ClipboardPlus className="w-4 h-4 text-brand-600" />
          Add Medical Record
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Today's Appointments"
          value={kpis.todayAppointments}
          icon={Calendar}
          color="blue"
          subtitle="Scheduled slots"
        />
        <StatCard
          title="Pending Requests"
          value={kpis.pendingAppointments}
          icon={Clock}
          color="amber"
          subtitle="Awaiting doctor confirmation"
        />
        <StatCard
          title="Completed Consultations"
          value={kpis.completedConsultations}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Clinical records documented"
        />
        <StatCard
          title="Unique Patients Treated"
          value={kpis.treatedPatients}
          icon={Users}
          color="purple"
          subtitle="Under your care"
        />
      </div>

      {/* Today's Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Appointment Schedule</h3>
            <p className="text-xs text-slate-400">Chronological outpatient queue for current date</p>
          </div>
          <Link to="/doctor/appointments" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            <span>View All Assigned</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Slot Time</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Demographics</th>
                <th className="py-2.5 px-3">Reason for Visit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Consultation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {todaySchedule.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No scheduled consultations for today.
                  </td>
                </tr>
              ) : (
                todaySchedule.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-brand-700">
                      {apt.appointment_time.slice(0, 5)}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{apt.patient_name}</p>
                      <p className="text-[10px] text-slate-400">{apt.patient_phone}</p>
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {apt.gender} • <span className="font-semibold text-rose-600">{apt.blood_group || 'N/A'}</span>
                    </td>

                    <td className="py-3 px-3 max-w-xs truncate text-slate-700">
                      {apt.reason}
                    </td>

                    <td className="py-3 px-3">
                      <Badge status={apt.status} />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/doctor/add-record?appointment_id=${apt.id}&patient_id=${apt.patient_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-[11px] hover:bg-brand-700 transition-colors"
                      >
                        <ClipboardPlus className="w-3.5 h-3.5" />
                        Record Diagnosis
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
