import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/api';
import Badge from '../../components/common/Badge';
import { Calendar, CalendarPlus, XCircle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await appointmentService.getAll(params);
      if (res.data?.data) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you wish to cancel this scheduled consultation?')) return;
    try {
      await appointmentService.updateStatus(id, 'Cancelled');
      showToast('Appointment successfully cancelled.');
      fetchAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel appointment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-white ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Scheduled Consultations</h1>
          <p className="text-xs text-slate-500 mt-1">Review your upcoming OPD appointments, doctor timings, and visit status</p>
        </div>
        <Link
          to="/patient/book-appointment"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all self-start"
        >
          <CalendarPlus className="w-4 h-4" />
          Book Another Visit
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st || 'All Bookings'}
          </button>
        ))}
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Doctor & Department</th>
                <th className="py-3 px-4">Date & Time Slot</th>
                <th className="py-3 px-4">Reason for Visit</th>
                <th className="py-3 px-4">Consultation Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading your appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No appointments found matching this status.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-700">
                      {apt.appointment_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{apt.doctor_name}</p>
                      <p className="text-[11px] text-brand-600 font-medium">{apt.specialization}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{apt.appointment_date.slice(0, 10)}</p>
                      <p className="text-[11px] text-slate-500">{apt.appointment_time.slice(0, 5)}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-600 truncate" title={apt.reason}>
                      {apt.reason}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ₹{apt.consultation_fee}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={apt.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' ? (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-[11px] transition-colors"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Locked</span>
                      )}
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

export default MyAppointments;
