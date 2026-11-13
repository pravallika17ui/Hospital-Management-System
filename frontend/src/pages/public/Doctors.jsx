import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/api';
import { Search, Filter, Stethoscope, Clock, Calendar, IndianRupee, Award } from 'lucide-react';

export const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecializations();
    fetchDoctors();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const res = await doctorService.getSpecializations();
      if (res.data?.data) {
        setSpecializations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async (spec = selectedSpecialty, query = search) => {
    setLoading(true);
    try {
      const params = {};
      if (spec) params.specialization = spec;
      if (query) params.search = query;

      const res = await doctorService.getAll(params);
      if (res.data?.data) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (spec) => {
    setSelectedSpecialty(spec);
    fetchDoctors(spec, search);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors(selectedSpecialty, search);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">Medical Faculty</span>
        <h1 className="text-4xl font-black text-slate-900 mt-2">Find a Specialist Doctor</h1>
        <p className="text-slate-600 mt-3 text-sm">
          Browse our certified specialists, view clinical qualifications, consultation hours, and schedule your appointment.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor name or qualification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </form>

        {/* Specialty filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => handleSpecialtyChange('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSpecialty === ''
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Specializations
          </button>
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => handleSpecialtyChange(spec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSpecialty === spec
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          Loading doctors directory...
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No doctors found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or specialization filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">{doc.name}</h3>
                      <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  <p className="font-medium text-slate-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-brand-600" />
                    <span>{doc.qualification}</span>
                  </p>
                  <p className="text-slate-500">
                    <span className="font-semibold text-slate-700">{doc.experience_years} Years</span> of clinical experience
                  </p>
                </div>

                {doc.bio && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    {doc.bio}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">Days:</span>
                    <span className="truncate">{doc.available_days}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">Timings:</span>
                    <span>{doc.available_time_start.slice(0, 5)} - {doc.available_time_end.slice(0, 5)}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee</span>
                  <span className="text-base font-extrabold text-slate-800">₹{doc.consultation_fee}</span>
                </div>

                <Link
                  to={`/login?redirect=book&doctor_id=${doc.id}`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
