import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/api';
import Badge from '../../components/common/Badge';
import { Calendar, CheckCircle2, XCircle, ClipboardPlus, Clock, AlertCircle } from 'lucide-react';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;

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
  }, [filterStatus]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      showToast(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update status', 'error');
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

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Appointments</h1>
        <p className="text-xs text-slate-500 mt-1">Accept booking requests, view patient symptoms, and record consultations</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st || 'All Appointments'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Apt #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Reason for Consultation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">No appointments found.</td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {apt.appointment_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{apt.patient_name}</p>
                      <p className="text-[11px] text-slate-400">{apt.gender} • {apt.patient_phone}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{apt.appointment_date.slice(0, 10)}</p>
                      <p className="text-[11px] text-brand-600 font-medium">{apt.appointment_time.slice(0, 5)}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={apt.reason}>
                      {apt.reason}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={apt.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                          >
                            Accept
                          </button>
                        )}

                        {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                          <Link
                            to={`/doctor/add-record?appointment_id=${apt.id}&patient_id=${apt.patient_id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-600 text-white font-bold text-[11px] hover:bg-brand-700 transition-colors"
                          >
                            <ClipboardPlus className="w-3.5 h-3.5" />
                            Prescribe / Complete
                          </Link>
                        )}

                        {apt.status === 'Completed' && (
                          <span className="text-[11px] font-bold text-emerald-600">
                            ✓ Documented
                          </span>
                        )}

                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                            className="px-2 py-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                            title="Decline / Cancel"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
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

export default DoctorAppointments;
