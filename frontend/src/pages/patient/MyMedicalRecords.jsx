import React, { useState, useEffect } from 'react';
import { medicalRecordService } from '../../services/api';
import Modal from '../../components/common/Modal';
import { FileHeart, Eye, Pill, Stethoscope, Calendar } from 'lucide-react';

export const MyMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    medicalRecordService.getAll().then((res) => {
      if (res.data?.data) {
        setRecords(res.data.data);
      }
      setLoading(false);
    });
  }, []);

  const handleOpenDetail = async (id) => {
    try {
      const res = await medicalRecordService.getById(id);
      if (res.data?.data) {
        setSelectedRecord(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Medical Records Dossier</h1>
        <p className="text-xs text-slate-500 mt-1">Access verified clinical diagnoses, physician remarks, and medical documentation</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Record Ref</th>
                <th className="py-3 px-4">Consulting Specialist</th>
                <th className="py-3 px-4">Visit Date</th>
                <th className="py-3 px-4">Clinical Diagnosis</th>
                <th className="py-3 px-4">Prescribed Medicines</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">Loading medical records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No medical records documented yet.</td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-700">{rec.record_number}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{rec.doctor_name}</p>
                      <p className="text-[11px] text-brand-600">{rec.specialization}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{rec.visit_date.slice(0, 10)}</td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-800 font-semibold truncate">{rec.diagnosis}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        <Pill className="w-3 h-3" /> {rec.prescription_count || 0} medicines
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(rec.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Clinical Summary
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord ? `Clinical Summary: ${selectedRecord.record_number}` : ''}
        subtitle={selectedRecord ? `Dr. ${selectedRecord.doctor_name} (${selectedRecord.specialization}) • ${selectedRecord.visit_date.slice(0, 10)}` : ''}
        maxWidth="max-w-2xl"
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Diagnosis</span>
              <p className="text-sm font-bold text-slate-900">{selectedRecord.diagnosis}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Presenting Symptoms</span>
              <p className="text-slate-700">{selectedRecord.symptoms}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Treatment Protocol</span>
              <p className="text-slate-700">{selectedRecord.treatment}</p>
            </div>

            {selectedRecord.notes && (
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 space-y-1">
                <span className="font-bold text-amber-800 uppercase text-[10px] block">Doctor's Dietary Advice & Instructions</span>
                <p className="text-amber-900">{selectedRecord.notes}</p>
              </div>
            )}

            {/* Prescriptions */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1">
                <Pill className="w-4 h-4 text-emerald-600" /> Prescribed Medications
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Medicine</th>
                      <th className="py-2 px-3">Dosage</th>
                      <th className="py-2 px-3">Frequency</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRecord.prescriptions?.map((pr) => (
                      <tr key={pr.id}>
                        <td className="py-2 px-3 font-bold text-slate-900">{pr.medicine_name}</td>
                        <td className="py-2 px-3">{pr.dosage}</td>
                        <td className="py-2 px-3 text-brand-700 font-semibold">{pr.frequency}</td>
                        <td className="py-2 px-3">{pr.duration}</td>
                        <td className="py-2 px-3 text-slate-500">{pr.instructions || '-'}</td>
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

export default MyMedicalRecords;
