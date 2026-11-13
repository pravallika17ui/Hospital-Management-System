import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/api';
import Modal from '../../components/common/Modal';
import { Users, Search, Eye, HeartPulse, Calendar, AlertCircle } from 'lucide-react';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientService.getAll({ search });
      if (res.data?.data?.patients) {
        setPatients(res.data.data.patients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenHistory = async (patientId) => {
    try {
      const res = await patientService.getById(patientId);
      if (res.data?.data) {
        setSelectedPatientHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Clinical Registry</h1>
        <p className="text-xs text-slate-500 mt-1">Review consulted patient histories, prior diagnostic impressions, and previous therapies</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPatients()}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <button
          onClick={fetchPatients}
          className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700"
        >
          Search
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Gender & DOB</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Medical Records</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">No patient records found.</td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{p.phone || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400">{p.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {p.gender} • {p.dob ? p.dob.slice(0, 10) : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                        {p.blood_group || 'N/A'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {p.total_records || 0} records
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenHistory(p.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Clinical History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      <Modal
        isOpen={!!selectedPatientHistory}
        onClose={() => setSelectedPatientHistory(null)}
        title={selectedPatientHistory ? `History: ${selectedPatientHistory.patient.name}` : ''}
        subtitle="Full patient clinical records and previous prescriptions"
        maxWidth="max-w-3xl"
      >
        {selectedPatientHistory && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl grid grid-cols-3 gap-2">
              <div><strong className="text-slate-500">Gender/DOB:</strong> {selectedPatientHistory.patient.gender} • {selectedPatientHistory.patient.dob?.slice(0, 10)}</div>
              <div><strong className="text-slate-500">Blood Group:</strong> {selectedPatientHistory.patient.blood_group}</div>
              <div><strong className="text-slate-500">Emergency:</strong> {selectedPatientHistory.patient.emergency_contact || 'N/A'}</div>
            </div>

            <div className="space-y-3">
              {selectedPatientHistory.medicalRecords.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                    <span>{m.diagnosis}</span>
                    <span className="text-slate-400 font-normal">{m.visit_date.slice(0, 10)}</span>
                  </div>
                  <p><strong className="text-slate-600">Symptoms:</strong> {m.symptoms}</p>
                  <p><strong className="text-slate-600">Treatment:</strong> {m.treatment}</p>
                  {m.notes && <p><strong className="text-slate-600">Notes:</strong> {m.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatients;
