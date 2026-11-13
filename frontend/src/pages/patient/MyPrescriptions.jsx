import React, { useState, useEffect } from 'react';
import { medicalRecordService } from '../../services/api';
import { Pill, Clock, Calendar, Stethoscope, AlertCircle } from 'lucide-react';

export const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicalRecordService.getAllPrescriptions().then((res) => {
      if (res.data?.data) {
        setPrescriptions(res.data.data);
      }
      setLoading(false);
    }).catch(err => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Medications & Prescriptions</h1>
        <p className="text-xs text-slate-500 mt-1">Computerized prescription schedule, administration timing, and dietary instructions</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Dosage</th>
                <th className="py-3 px-4">Schedule / Frequency</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Prescribed By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading prescriptions...</td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No active prescriptions found on your health record.
                  </td>
                </tr>
              ) : (
                prescriptions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      <span>{p.medicine_name}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {p.dosage}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-brand-700">
                      {p.frequency}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {p.duration}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.doctor_name}</p>
                      <p className="text-[10px] text-brand-600">{p.specialization}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {p.visit_date ? p.visit_date.slice(0, 10) : 'Recent'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={p.instructions}>
                      {p.instructions || 'Follow doctor directions'}
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

export default MyPrescriptions;
