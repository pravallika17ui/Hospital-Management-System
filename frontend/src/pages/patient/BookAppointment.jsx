import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doctorService, appointmentService } from '../../services/api';
import { Calendar, Clock, Stethoscope, CheckCircle2, AlertCircle, CalendarPlus, UserCheck, Shield } from 'lucide-react';

export const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Tomorrow's date default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState(defaultDateStr);
  const [slotsData, setSlotsData] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [reason, setReason] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Handle URL pre-selection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const preselectedDocId = searchParams.get('doctor_id');
    if (preselectedDocId) {
      setSelectedDoctorId(preselectedDocId);
    }
  }, [location.search]);

  // Load specializations & doctors
  useEffect(() => {
    doctorService.getSpecializations().then(res => setSpecializations(res.data?.data || []));
    doctorService.getAll().then(res => {
      const docs = res.data?.data || [];
      setDoctors(docs);
      if (selectedDoctorId) {
        const found = docs.find(d => String(d.id) === String(selectedDoctorId));
        if (found) {
          setSelectedDoctor(found);
          setSelectedSpecialty(found.specialization);
        }
      }
    });
  }, [selectedDoctorId]);

  // When doctor or date changes, fetch real-time slots
  useEffect(() => {
    if (!selectedDoctorId || !appointmentDate) {
      setSlotsData(null);
      setSelectedTimeSlot('');
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedTimeSlot('');
      try {
        const res = await doctorService.getAvailableSlots(selectedDoctorId, appointmentDate);
        if (res.data?.data) {
          setSlotsData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load doctor slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleDoctorChange = (id) => {
    setSelectedDoctorId(id);
    const doc = doctors.find(d => String(d.id) === String(id));
    setSelectedDoctor(doc || null);
  };

  const filteredDoctors = selectedSpecialty
    ? doctors.filter(d => d.specialization === selectedSpecialty)
    : doctors;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !appointmentDate || !selectedTimeSlot || !reason) {
      return showToast('Please select doctor, date, available time slot, and reason.', 'error');
    }

    setBookingLoading(true);
    try {
      const res = await appointmentService.book({
        doctor_id: selectedDoctorId,
        appointment_date: appointmentDate,
        appointment_time: selectedTimeSlot,
        reason
      });

      const apt = res.data?.data;
      showToast(`Appointment booked successfully! Ref: ${apt?.appointment_number}`);
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 1200);
    } catch (err) {
      showToast(err.response?.data?.message || 'Slot conflict or booking error. Please try another slot.', 'error');
    } finally {
      setBookingLoading(false);
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
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Book an Outpatient Consultation</h1>
        <p className="text-xs text-slate-500 mt-1">Select your specialty, choose your doctor, and lock an available real-time slot</p>
      </div>

      <form onSubmit={handleBook} className="space-y-6">
        
        {/* Step 1: Select Specialty and Doctor */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Stethoscope className="w-4 h-4 text-brand-600" />
            Step 1: Choose Medical Department & Specialist
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Department / Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setSelectedDoctorId('');
                  setSelectedDoctor(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="">-- All Specializations --</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Doctor *</label>
              <select
                required
                value={selectedDoctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="">-- Choose Specialist Doctor --</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialization} (Fee: ₹{doc.consultation_fee})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Doctor Summary Card */}
          {selectedDoctor && (
            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                  {selectedDoctor.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedDoctor.name}</h4>
                  <p className="text-brand-700 font-semibold">{selectedDoctor.qualification} • {selectedDoctor.specialization}</p>
                  <p className="text-slate-500 text-[11px]">Available: {selectedDoctor.available_days}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                <span className="text-lg font-black text-slate-900">₹{selectedDoctor.consultation_fee}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Date & Real-Time Slot Picker */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-brand-600" />
            Step 2: Select Date & Available Time Slot
          </h3>

          <div className="max-w-xs">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Consultation Date *</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            />
          </div>

          {/* Time Slots Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Available Time Slots *</label>
            
            {!selectedDoctorId ? (
              <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl">Please select a doctor first to view consultation slots.</p>
            ) : loadingSlots ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <span className="inline-block w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Checking live slot availability...
              </div>
            ) : slotsData && !slotsData.available ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>{slotsData.reason}</span>
              </div>
            ) : slotsData && slotsData.slots ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {slotsData.slots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                          !slot.isAvailable
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-600'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50/50'
                        }`}
                      >
                        <span>{slot.displayTime}</span>
                        <span className="text-[9px] font-normal">
                          {slot.isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-600"></span> Selected</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white border border-slate-300"></span> Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-200"></span> Booked (Conflict protected)</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Step 3: Reason for Consultation */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-brand-600" />
            Step 3: Clinical Reason for Visit
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Describe Symptoms or Purpose of Visit *</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Experiencing persistent migraine headaches with nausea since last weekend, need neurology consultation..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Confirm Booking CTA */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={bookingLoading || !selectedTimeSlot}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {bookingLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <CalendarPlus className="w-4 h-4" />
                Confirm & Book Consultation
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default BookAppointment;
