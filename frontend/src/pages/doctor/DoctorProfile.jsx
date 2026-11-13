import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorService, authService } from '../../services/api';
import { UserCheck, CheckCircle2, AlertCircle, Clock, Calendar, IndianRupee, Save } from 'lucide-react';

export const DoctorProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialization: user?.specialization || 'Cardiology',
    qualification: user?.qualification || 'MBBS, MD',
    experience_years: user?.experience_years || 5,
    consultation_fee: user?.consultation_fee || 500,
    available_days: user?.available_days || 'Monday,Tuesday,Wednesday,Thursday,Friday',
    available_time_start: user?.available_time_start || '09:00:00',
    available_time_end: user?.available_time_end || '17:00:00',
    bio: user?.bio || ''
  });

  useEffect(() => {
    authService.getMe().then((res) => {
      if (res.data?.data) {
        const u = res.data.data;
        setFormData({
          name: u.name,
          phone: u.phone || '',
          specialization: u.specialization || '',
          qualification: u.qualification || '',
          experience_years: u.experience_years || 0,
          consultation_fee: u.consultation_fee || 500,
          available_days: u.available_days || '',
          available_time_start: u.available_time_start || '09:00:00',
          available_time_end: u.available_time_end || '17:00:00',
          bio: u.bio || ''
        });
      }
    });
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user?.doctor_id) {
        await doctorService.update(user.doctor_id, formData);
        updateUser(formData);
        showToast('Consultation schedule and fees updated successfully!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-white ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctor Profile & Practice Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure your consultation pricing, daily slot timings, and clinical bio</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
            <input
              type="text"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
            <input
              type="text"
              required
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
            <input
              type="number"
              min="0"
              required
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Schedule & Fees Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            Consultation Hours & OPD Fees
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Slot Start Time</label>
              <input
                type="time"
                required
                value={formData.available_time_start}
                onChange={(e) => setFormData({ ...formData, available_time_start: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Slot End Time</label>
              <input
                type="time"
                required
                value={formData.available_time_end}
                onChange={(e) => setFormData({ ...formData, available_time_end: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Available Consulting Days</label>
            <input
              type="text"
              required
              value={formData.available_days}
              onChange={(e) => setFormData({ ...formData, available_days: e.target.value })}
              placeholder="Monday,Tuesday,Wednesday,Thursday,Friday"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Biography / Specialties Description</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            Save Practice Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
