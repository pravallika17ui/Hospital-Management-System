import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Calendar, Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle, Trash2, Edit3 } from 'lucide-react';

export const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Status Change Modal
  const [activeApt, setActiveApt] = useState(null);
  const [newStatus, setNewStatus] = useState('Confirmed');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedDate) params.date = selectedDate;

      const res = await appointmentService.getAll(params);
      if (res.data?.data) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus, selectedDate]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeApt) return;

    try {
      await appointmentService.updateStatus(activeApt.id, newStatus);
      showToast(`Appointment ${activeApt.appointment_number} marked as ${newStatus}.`);
      setActiveApt(null);
      fetchAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment record?')) return;
    try {
      await appointmentService.delete(id);
      showToast('Appointment removed.');
      fetchAppointments();
    } catch (err) {
      showToast('Failed to delete appointment', 'error');
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
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Master Control</h1>
        <p className="text-xs text-slate-500 mt-1">Review scheduled OPD patient visits, approve requests, and monitor consultation workflow</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Appointments'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Apt Number</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Doctor & Specialty</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Reason for Visit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">No appointments matching criteria.</td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {apt.appointment_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{apt.patient_name}</p>
                      <p className="text-[11px] text-slate-400">{apt.patient_phone || apt.patient_email}</p>
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

                    <td className="py-3.5 px-4">
                      <Badge status={apt.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setActiveApt(apt);
                            setNewStatus(apt.status);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={!!activeApt}
        onClose={() => setActiveApt(null)}
        title="Update Appointment Status"
        subtitle={activeApt ? `Ref: ${activeApt.appointment_number} • Patient: ${activeApt.patient_name}` : ''}
        maxWidth="max-w-md"
      >
        {activeApt && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="Pending">Pending (Under review)</option>
                <option value="Confirmed">Confirmed (Slot reserved)</option>
                <option value="Completed">Completed (Consultation finished)</option>
                <option value="Cancelled">Cancelled (Slot freed)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveApt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-md shadow-brand-500/20"
              >
                Confirm Update
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageAppointments;
