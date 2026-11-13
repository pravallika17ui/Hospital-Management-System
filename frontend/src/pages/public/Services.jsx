import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Bone, 
  Baby, 
  Activity, 
  Microscope, 
  Pill, 
  Ambulance, 
  ShieldAlert, 
  Eye, 
  Syringe, 
  ThermometerSnowflake 
} from 'lucide-react';

export const Services = () => {
  const services = [
    { title: 'Outpatient Department (OPD)', icon: Activity, desc: 'Specialist consultations across 20+ disciplines with dedicated morning and evening shifts.' },
    { title: 'Emergency & 24/7 Trauma Care', icon: Ambulance, desc: 'Immediate resuscitation, advanced mobile trauma units, and round-the-clock emergency surgeons.' },
    { title: 'Diagnostic Imaging & Radiology', icon: Microscope, desc: 'High resolution 3T MRI, 128-Slice CT, 4D Ultrasound, Digital X-Ray, and Mammography.' },
    { title: 'Advanced Intensive Care Unit (ICU)', icon: ShieldAlert, desc: 'Dedicated MICU, CCU, and NICU equipped with high-frequency mechanical ventilators and hemodynamic monitoring.' },
    { title: 'Cardiology & Cath Lab', icon: Heart, desc: 'Coronary angiography, primary angioplasty, pacemaker implantation, and echocardiography.' },
    { title: 'Neurology & Neurosurgery', icon: Brain, desc: 'Comprehensive treatment for stroke, epilepsy, degenerative neurological disorders, and brain surgeries.' },
    { title: 'Orthopedics & Spine Care', icon: Bone, desc: 'Robotic-assisted joint replacement, arthroscopy, fracture trauma management, and spine stabilization.' },
    { title: 'Pediatrics & Neonatology', icon: Baby, desc: 'Dedicated pediatric wards, level III NICU, developmental checkups, and national immunization schedule.' },
    { title: '24/7 In-House Pharmacy', icon: Pill, desc: 'Fully stocked hospital pharmacy dispensing genuine medications, refrigerated biologics, and surgical consumables.' },
    { title: 'Pathology & Blood Bank', icon: Syringe, desc: 'Fully automated biochemistry analyzers, microbiology cultures, and voluntary blood banking facility.' },
    { title: 'Ophthalmology', icon: Eye, desc: 'Micro-incision cataract surgeries, glaucoma screening, retina evaluation, and refractive error corrections.' },
    { title: 'Dialysis & Nephrology Unit', icon: ThermometerSnowflake, desc: 'State-of-the-art hemodialysis machines adhering to strict infection control and biocompatible water treatment.' }
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">Hospital Facilities</span>
        <h1 className="text-4xl font-black text-slate-900 mt-2">Comprehensive Clinical Services & Facilities</h1>
        <p className="text-slate-600 mt-4 text-base">
          From preventive outpatient screenings to advanced emergency interventions, our multi-specialty healthcare infrastructure is built to support every stage of healing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <div key={i} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{svc.title}</h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{svc.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Book banner */}
      <div className="bg-brand-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-brand-600/20">
        <div>
          <h3 className="text-2xl font-bold">Ready to Consult One of Our Specialists?</h3>
          <p className="text-brand-100 text-sm mt-1">Book your appointment online in under two minutes with instant slot confirmation.</p>
        </div>
        <Link
          to="/login"
          className="px-6 py-3 rounded-xl bg-white text-brand-700 font-bold text-sm shadow-md hover:bg-brand-50 transition-colors flex-shrink-0"
        >
          Book Consultation Now
        </Link>
      </div>
    </div>
  );
};

export default Services;
