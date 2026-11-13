import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: About CarePoint */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                CarePoint<span className="text-brand-500">.</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              CarePoint Super Specialty Hospital is committed to delivering state-of-the-art medical excellence, clinical research, and empathetic patient care across 25+ medical departments.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" /> NABH & JCI Accredited Hospital
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Our Hospital</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition-colors">Find a Doctor</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Medical Specialties</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Book OPD Appointment</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Patient Registration</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Help & Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Key Departments */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Clinical Departments</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Cardiology & Heart Care</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Neurology & Neurosurgery</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Orthopedics & Joint Replacement</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Pediatrics & Neonatal Care</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Oncology & Chemotherapy</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Emergency Trauma & ICU</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Contact Information</h4>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
              <span>CarePoint Medical Enclave, Bannerghatta Main Road, Bengaluru, Karnataka 560076</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>+91 80 4000 5000 / 108</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>support@carepointhospital.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>Emergency 24/7 | OPD 9:00 AM - 6:00 PM</span>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CarePoint Hospital Management System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered for excellence with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>as a professional B.Tech Capstone Project</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
