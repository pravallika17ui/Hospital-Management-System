import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { medicalRecordService, patientService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClipboardPlus, Plus, Trash2, CheckCircle2, AlertCircle, Pill, Stethoscope, ArrowLeft } from 'lucide-react';

export const AddMedicalRecord = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Extract query params if navigated from an appointment
  const searchParams = new URLSearchParams(location.search);
  const queryAppointmentId = searchParams.get('appointment_id') || '';
  const queryPatientId = searchParams.get('patient_id') || '';

  const [formData, setFormData] = useState({
    patient_id: queryPatientId,
    appointment_id: queryAppointmentId,
    doctor_id: user?.doctor_id || '',
    visit_date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    prescriptions: [
      { medicine_name: '', dosage: '500 mg', frequency: '1-0-1 (After meals)', duration: '5 Days', instructions: 'Take with water' }
    ]
  });

  useEffect(() => {
    patientService.getAll({ limit: 100 })
      .then(res => setPatients(res.data?.data?.patients || []))
      .catch(err => console.error(err));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleAddPrescriptionRow = () => {
    setFormData({
      ...formData,
      prescriptions: [
        ...formData.prescriptions,
        { medicine_name: '', dosage: '500 mg', frequency: '1-0-1 (After meals)', duration: '5 Days', instructions: '' }
      ]
    });
  };

  const handleRemovePrescriptionRow = (index) => {
    const updated = formData.prescriptions.filter((_, i) => i !== index);
    setFormData({ ...formData, prescriptions: updated });
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...formData.prescriptions];
    updated[index][field] = value;
    setFormData({ ...formData, prescriptions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out blank prescriptions
      const cleanedData = {
        ...formData,
        doctor_id: user?.doctor_id,
        prescriptions: formData.prescriptions.filter(p => p.medicine_name.trim() !== '')
      };

      await medicalRecordService.create(cleanedData);
      showToast('Clinical medical record and prescriptions saved!');
      setTimeout(() => {
        navigate('/doctor/appointments');
      }, 1200);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to document medical record', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-white ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Encounter & Prescription</h1>
          <p className="text-xs text-slate-500">Document patient findings, clinical diagnoses, and issue computerized prescriptions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Patient and Visit Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-brand-600" />
            1. Patient & Encounter Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (Blood: {p.blood_group || 'N/A'}, Phone: {p.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Date *</label>
              <input
                type="date"
                required
                value={formData.visit_date}
                onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Clinical Observations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ClipboardPlus className="w-4 h-4 text-brand-600" />
            2. Clinical Assessment & Findings
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Presenting Symptoms & Vitals *</label>
            <textarea
              rows={2}
              required
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="e.g. Fever 101F, productive cough for 3 days, mild dyspnea, BP 130/85 mmHg"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="e.g. Acute Bronchitis / Stage 1 Essential Hypertension"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Plan & Procedures *</label>
            <textarea
              rows={2}
              required
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="e.g. Bronchodilator therapy, oral antibiotics, warm steam inhalation, chest physiotherapy"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Doctor's Dietary Advice & Follow-up Remarks</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Drink 3L fluids daily, avoid cold foods. Review in 7 days if symptoms persist."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Multi-Item Prescriptions Builder */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              3. Prescribed Medications ({formData.prescriptions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddPrescriptionRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </div>

          <div className="space-y-3">
            {formData.prescriptions.map((row, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Medicine #{idx + 1}</span>
                  {formData.prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrescriptionRow(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Medicine Name & Formulation</label>
                    <input
                      type="text"
                      required
                      value={row.medicine_name}
                      onChange={(e) => handlePrescriptionChange(idx, 'medicine_name', e.target.value)}
                      placeholder="e.g. Amoxicillin Clavulanate"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={row.dosage}
                      onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                      placeholder="e.g. 625 mg"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Frequency</label>
                    <input
                      type="text"
                      value={row.frequency}
                      onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                      placeholder="1-0-1 (Morning-Night)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={row.duration}
                      onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                      placeholder="5 Days"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Special Instructions</label>
                    <input
                      type="text"
                      value={row.instructions}
                      onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                      placeholder="Take after meals with water"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save & Finalize Clinical Record
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddMedicalRecord;
