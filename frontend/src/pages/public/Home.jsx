import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/api';
import {
  Calendar,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Clock,
  Award,
  Users,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  MapPin,
  Sparkles
} from 'lucide-react';

export const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorService.getAll();
        if (res.data?.data) {
          setFeaturedDoctors(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const stats = [
    { label: 'Specialist Doctors', value: '45+', icon: Stethoscope },
    { label: 'Patients Treated', value: '30,000+', icon: Users },
    { label: 'Critical Care Beds', value: '250+', icon: HeartPulse },
    { label: 'Patient Satisfaction', value: '99.4%', icon: Award }
  ];

  const departments = [
    { name: 'Cardiology', desc: 'Comprehensive cardiac catheterization, bypass surgery, and angiography.', color: 'from-rose-500/10 to-transparent', iconBg: 'bg-rose-50 text-rose-600' },
    { name: 'Neurology', desc: 'Advanced stroke management, neuro-rehabilitation, and epilepsy care.', color: 'from-purple-500/10 to-transparent', iconBg: 'bg-purple-50 text-purple-600' },
    { name: 'Orthopedics', desc: 'Robotic joint replacement, sports injury treatment, and spine trauma.', color: 'from-blue-500/10 to-transparent', iconBg: 'bg-blue-50 text-blue-600' },
    { name: 'Pediatrics', desc: 'Child health monitoring, neonatal ICU, and routine pediatric vaccination.', color: 'from-emerald-500/10 to-transparent', iconBg: 'bg-emerald-50 text-emerald-600' },
    { name: 'Oncology', desc: 'Multidisciplinary tumor boards, medical oncology, and precision surgery.', color: 'from-amber-500/10 to-transparent', iconBg: 'bg-amber-50 text-amber-600' },
    { name: 'Emergency & Trauma', desc: '24/7 Level-1 trauma response team with rapid triage stabilization.', color: 'from-red-500/10 to-transparent', iconBg: 'bg-red-50 text-red-600' }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-slate-50 pt-12 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                NABH & JCI Certified Super Specialty Healthcare
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Excellence in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-600">Medicine</span>, Compassion in <span className="text-slate-900">Care</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Experience world-class healthcare with top medical specialists, digital appointment scheduling, computerized medical history, and transparent healthcare billing.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 hover:shadow-xl transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  Book OPD Appointment
                </Link>

                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-white text-slate-700 border border-slate-200 hover:border-brand-300 hover:text-brand-600 shadow-sm transition-all"
                >
                  <Stethoscope className="w-5 h-5 text-brand-600" />
                  Find a Doctor
                </Link>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>24/7 Trauma Unit</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Verified Specialists</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Instant E-Prescriptions</span>
                </div>
              </div>
            </div>

            {/* Hero Card Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-400 to-cyan-400 opacity-30 blur-xl" />
                <div className="relative rounded-3xl bg-white p-8 shadow-2xl border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Rapid OPD Desk</h4>
                        <p className="text-xs text-slate-400">Available Doctors on Duty</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      Live Queue
                    </span>
                  </div>

                  {/* Sample doctor row */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Dr. Rajesh Sharma</p>
                        <p className="text-[11px] text-brand-600 font-medium">Cardiology • 14 Yrs Exp</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                        ₹800
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Dr. Anita Desai</p>
                        <p className="text-[11px] text-brand-600 font-medium">Neurology • 11 Yrs Exp</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                        ₹900
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Dr. Vikram Reddy</p>
                        <p className="text-[11px] text-brand-600 font-medium">Orthopedics • 9 Yrs Exp</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                        ₹700
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="block w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-center text-xs hover:bg-slate-800 transition-colors"
                  >
                    Register Online to Access Patient Portal
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{item.value}</h3>
                  <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CLINICAL DEPARTMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">Centers of Excellence</span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">Comprehensive Clinical Specialties</h2>
          <p className="text-slate-600 text-sm mt-3">Equipped with modular operation theaters, high-resolution diagnostics, and multi-disciplinary teams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base mb-4 ${dept.iconBg}`}>
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {dept.desc}
              </p>
              <Link to="/doctors" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 mt-4 hover:gap-2 transition-all">
                <span>View Specialists</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED DOCTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-brand-50/50 py-16 rounded-3xl border border-brand-100/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">Our Experts</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Meet Our Senior Consultants</h2>
          </div>
          <Link to="/doctors" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 mt-4 md:mt-0">
            <span>Explore All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDoctors.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {doc.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{doc.name}</h4>
                  <p className="text-xs font-semibold text-brand-600">{doc.specialization}</p>
                  <p className="text-[11px] text-slate-400">{doc.experience_years} Years Experience</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 line-clamp-2">
                {doc.bio || `${doc.qualification} with clinical expertise in treating complex cases.`}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation</span>
                  <span className="text-sm font-extrabold text-slate-800">₹{doc.consultation_fee}</span>
                </div>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. EMERGENCY CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <HeartPulse className="w-3.5 h-3.5 animate-pulse" /> Emergency Response Center
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Need Immediate Critical Medical Attention?</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our 24x7 emergency department is equipped with mobile ICUs, advanced resuscitators, on-call interventional surgeons, and a zero-delay ambulance dispatch system.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="tel:108"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-base hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition-all"
              >
                <PhoneCall className="w-5 h-5" />
                Call 108 / +91 80 4000 5000
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/10 transition-all"
              >
                <MapPin className="w-4 h-4 text-brand-400" />
                Hospital Directions
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
