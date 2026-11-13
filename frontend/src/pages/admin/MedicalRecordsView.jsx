import React, { useState, useEffect } from 'react';
import { medicalRecordService } from '../../services/api';
import Modal from '../../components/common/Modal';
import { FileText, Search, Eye, Pill, Stethoscope, HeartPulse, User } from 'lucide-react';

export const MedicalRecordsView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;

      const res = await medicalRecordService.getAll(params);
      if (res.data?.data) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await medicalRecordService.getById(id);
      if (res.data?.data) {
        setSelectedRecord(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Medical Records</h1>
        <p className="text-xs text-slate-500 mt-1">Computerized health archive, clinical notes, and prescription history</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by record #, diagnosis, or patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRecords()}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <button
          onClick={fetchRecords}
          className="px-4 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Record Number</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Consulting Doctor</th>
                <th className="py-3 px-4">Visit Date</th>
                <th className="py-3 px-4">Clinical Diagnosis</th>
                <th className="py-3 px-4">Prescriptions</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">No medical records documented yet.</td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-700">
                      {rec.record_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{rec.patient_name}</p>
                      <p className="text-[11px] text-slate-400">{rec.gender} • {rec.blood_group || 'N/A'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{rec.doctor_name}</p>
                      <p className="text-[11px] text-brand-600">{rec.specialization}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {rec.visit_date.slice(0, 10)}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-800 font-medium truncate" title={rec.diagnosis}>
                      {rec.diagnosis}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        <Pill className="w-3 h-3" /> {rec.prescription_count || 0} meds
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(rec.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-600 font-bold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Full Case
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Full Details Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord ? `Clinical Summary: ${selectedRecord.record_number}` : ''}
        subtitle={selectedRecord ? `Patient: ${selectedRecord.patient_name} • Dr. ${selectedRecord.doctor_name}` : ''}
        maxWidth="max-w-3xl"
      >
        {selectedRecord && (
          <div className="space-y-5 text-xs">
            {/* Metadata Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 block font-semibold">Consultation Date:</span>
                <span className="font-bold text-slate-800">{selectedRecord.visit_date.slice(0, 10)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Blood Group / Gender:</span>
                <span className="font-bold text-slate-800">{selectedRecord.blood_group || 'N/A'} • {selectedRecord.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Specialty:</span>
                <span className="font-bold text-brand-700">{selectedRecord.specialization}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Appointment Ref:</span>
                <span className="font-bold text-slate-800">{selectedRecord.appointment_number || 'Walk-in'}</span>
              </div>
            </div>

            {/* Symptoms & Diagnosis */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide text-brand-600">Patient Symptoms</h4>
                <p className="text-slate-700 leading-relaxed">{selectedRecord.symptoms}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide text-brand-600">Clinical Diagnosis</h4>
                <p className="text-slate-800 font-semibold text-sm leading-relaxed">{selectedRecord.diagnosis}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-white">
                <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide text-brand-600">Treatment & Clinical Plan</h4>
                <p className="text-slate-700 leading-relaxed">{selectedRecord.treatment}</p>
              </div>

              {selectedRecord.notes && (
                <div className="p-3.5 rounded-xl border border-slate-100 bg-amber-50/50">
                  <h4 className="font-bold text-amber-800 mb-1 text-xs uppercase tracking-wide">Doctor Remarks & Dietary Advice</h4>
                  <p className="text-amber-900 leading-relaxed">{selectedRecord.notes}</p>
                </div>
              )}
            </div>

            {/* Attached Prescriptions */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                <Pill className="w-4 h-4 text-emerald-600" /> Prescribed Medicines ({selectedRecord.prescriptions?.length || 0})
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRecord.prescriptions?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">No medicines prescribed.</td>
                      </tr>
                    ) : (
                      selectedRecord.prescriptions.map((pr) => (
                        <tr key={pr.id}>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{pr.medicine_name}</td>
                          <td className="py-2.5 px-3">{pr.dosage}</td>
                          <td className="py-2.5 px-3 text-brand-700 font-medium">{pr.frequency}</td>
                          <td className="py-2.5 px-3 font-semibold">{pr.duration}</td>
                          <td className="py-2.5 px-3 text-slate-500">{pr.instructions || '-'}</td>
                        </tr>
                      ))
                    )}
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

export default MedicalRecordsView;
