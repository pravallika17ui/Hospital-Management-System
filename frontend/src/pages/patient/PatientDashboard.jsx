import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Calendar, FileHeart, Pill, Receipt, CalendarPlus, Clock, ArrowRight, Activity, Stethoscope } from 'lucide-react';

export const PatientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getPatientStats();
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

  const { kpis, nextAppointment } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-brand-200">Patient Health Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black">Your Health Overview</h1>
          <p className="text-brand-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            Manage your scheduled hospital visits, view doctor clinical diagnoses, track prescription dosages, and settle invoices online.
          </p>
        </div>
        <Link
          to="/patient/book-appointment"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-extrabold text-sm shadow-md hover:bg-brand-50 transition-all flex-shrink-0 self-start"
        >
          <CalendarPlus className="w-4 h-4 text-brand-600" />
          Book New Consultation
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Upcoming Appointments"
          value={kpis.upcomingAppointments}
          icon={Calendar}
          color="blue"
          subtitle="Confirmed & Pending"
        />
        <StatCard
          title="Past Consultations"
          value={kpis.completedAppointments}
          icon={Clock}
          color="emerald"
          subtitle="Treated visits"
        />
        <StatCard
          title="Medical Case Records"
          value={kpis.totalRecords}
          icon={FileHeart}
          color="purple"
          subtitle="Clinical summaries"
        />
        <StatCard
          title="Outstanding Bills"
          value={`₹${kpis.unpaidBillsTotal.toLocaleString()}`}
          icon={Receipt}
          color="rose"
          subtitle={`${kpis.unpaidBillsCount} unpaid invoice(s)`}
        />
      </div>

      {/* Next Upcoming Appointment Highlight Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Next Scheduled Consultation</h3>
              <p className="text-xs text-slate-400">Doctor appointment reminder</p>
            </div>
          </div>
          <Link
            to="/patient/appointments"
            className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
          >
            <span>View All My Appointments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {nextAppointment ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Appointment Ref</span>
              <p className="text-sm font-extrabold text-brand-700">{nextAppointment.appointment_number}</p>
              <Badge status={nextAppointment.status} className="mt-1.5" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Specialist Doctor</span>
              <p className="text-sm font-bold text-slate-900">{nextAppointment.doctor_name}</p>
              <p className="text-xs text-brand-600 font-semibold">{nextAppointment.specialization}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Date & Scheduled Slot</span>
              <p className="text-sm font-extrabold text-slate-800">{nextAppointment.appointment_date.slice(0, 10)}</p>
              <p className="text-xs text-slate-500 font-medium">{nextAppointment.appointment_time.slice(0, 5)} (Slot)</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Reason</span>
              <p className="text-xs text-slate-700 truncate" title={nextAppointment.reason}>
                {nextAppointment.reason}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-slate-400">You have no upcoming appointments scheduled.</p>
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Schedule a Consultation Now
            </Link>
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/patient/records"
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <FileHeart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              Medical Records
            </h4>
            <p className="text-xs text-slate-500 mt-1">Access past clinical diagnoses, vital signs, and discharge notes.</p>
          </div>
          <span className="text-xs font-bold text-brand-600 mt-4 flex items-center gap-1">
            Open Dossier <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/patient/prescriptions"
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Pill className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              My Prescriptions
            </h4>
            <p className="text-xs text-slate-500 mt-1">Review active medications, dosage schedules, and food instructions.</p>
          </div>
          <span className="text-xs font-bold text-brand-600 mt-4 flex items-center gap-1">
            View Medicines <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/patient/bills"
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
              Invoices & Billing
            </h4>
            <p className="text-xs text-slate-500 mt-1">View itemized consultation fees, payment receipts, and settle bills online.</p>
          </div>
          <span className="text-xs font-bold text-brand-600 mt-4 flex items-center gap-1">
            View Invoices <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

    </div>
  );
};

export default PatientDashboard;
