import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Users, Plus, Search, Eye, Edit2, Trash2, Phone, Calendar, HeartPulse, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    phone: '',
    dob: '',
    gender: 'Male',
    blood_group: 'O+',
    address: '',
    emergency_contact: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (bloodGroup) params.blood_group = bloodGroup;

      const res = await patientService.getAll(params);
      if (res.data?.data?.patients) {
        setPatients(res.data.data.patients);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [bloodGroup]);

  const handleOpenHistory = async (patientId) => {
    setHistoryLoading(true);
    try {
      const res = await patientService.getById(patientId);
      if (res.data?.data) {
        setSelectedPatientHistory(res.data.data);
      }
    } catch (err) {
      showToast('Could not load patient clinical history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await patientService.create(formData);
      showToast(`Patient ${formData.name} registered successfully!`);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'Password@123',
        phone: '',
        dob: '',
        gender: 'Male',
        blood_group: 'O+',
        address: '',
        emergency_contact: ''
      });
      fetchPatients();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register patient', 'error');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient record and all related history?')) return;
    try {
      await patientService.delete(id);
      showToast('Patient record deleted.');
      fetchPatients();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete patient', 'error');
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Hospital outpatient/inpatient registered records, blood groups, and visits</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Register Patient
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPatients()}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <button
            onClick={fetchPatients}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Gender & DOB</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Appointments</th>
                <th className="py-3 px-4">Medical Records</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">No patients registered.</td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.name}
                      <span className="block text-[10px] text-slate-400 font-normal">ID: PAT-{String(p.id).padStart(4, '0')}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 font-medium">{p.phone || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400">{p.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{p.gender}</span>
                      <p className="text-[11px] text-slate-400">{p.dob ? p.dob.slice(0, 10) : 'N/A'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {p.blood_group ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-black text-[11px]">
                          {p.blood_group}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-brand-600">
                      {p.total_appointments || 0} visits
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {p.total_records || 0} records
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenHistory(p.id)}
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                          title="View Clinical History"
                        >
                          <Eye className="w-3.5 h-3.5" /> History
                        </button>
                        <button
                          onClick={() => handleDeletePatient(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Patient"
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

      {/* Register Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Patient"
        subtitle="Create hospital record for outpatient or emergency consultation"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ramesh Gupta"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ramesh@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="+91 98111 22334"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full residential address"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-md shadow-brand-500/20"
            >
              Register Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Patient History Detail Modal */}
      <Modal
        isOpen={!!selectedPatientHistory}
        onClose={() => setSelectedPatientHistory(null)}
        title={selectedPatientHistory ? `Medical Dossier: ${selectedPatientHistory.patient.name}` : ''}
        subtitle="Complete chronological history of appointments, diagnoses, treatments, and billing"
        maxWidth="max-w-4xl"
      >
        {selectedPatientHistory && (
          <div className="space-y-6">
            {/* Demographics Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Gender / DOB:</span>
                <span className="font-bold text-slate-800">{selectedPatientHistory.patient.gender} • {selectedPatientHistory.patient.dob ? selectedPatientHistory.patient.dob.slice(0, 10) : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Blood Group:</span>
                <span className="font-bold text-rose-600">{selectedPatientHistory.patient.blood_group || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Phone:</span>
                <span className="font-bold text-slate-800">{selectedPatientHistory.patient.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Emergency Contact:</span>
                <span className="font-bold text-slate-800">{selectedPatientHistory.patient.emergency_contact || 'N/A'}</span>
              </div>
            </div>

            {/* Medical Records Section */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-brand-600" />
                Clinical Diagnoses & Treatment Records
              </h4>
              {selectedPatientHistory.medicalRecords.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl">No medical records documented yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedPatientHistory.medicalRecords.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-brand-700">{m.record_number}</span>
                        <span className="text-slate-400">{m.visit_date.slice(0, 10)} • {m.doctor_name} ({m.specialization})</span>
                      </div>
                      <p><strong className="text-slate-700">Diagnosis:</strong> {m.diagnosis}</p>
                      <p><strong className="text-slate-700">Symptoms:</strong> {m.symptoms}</p>
                      <p><strong className="text-slate-700">Treatment:</strong> {m.treatment}</p>
                      {m.notes && <p><strong className="text-slate-700">Notes:</strong> {m.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Appointments Section */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Appointments Log
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Doctor</th>
                      <th className="py-2 px-3">Reason</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPatientHistory.appointments.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2 px-3">{a.appointment_date.slice(0, 10)} {a.appointment_time.slice(0, 5)}</td>
                        <td className="py-2 px-3 font-medium">{a.doctor_name}</td>
                        <td className="py-2 px-3 text-slate-500 max-w-[200px] truncate">{a.reason}</td>
                        <td className="py-2 px-3"><Badge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagePatients;
