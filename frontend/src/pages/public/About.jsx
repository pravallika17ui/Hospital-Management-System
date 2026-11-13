import React from 'react';
import { ShieldCheck, Award, HeartHandshake, Stethoscope, Clock, CheckCircle } from 'lucide-react';

export const About = () => {
  return (
    <div className="py-12 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">About CarePoint Hospital</span>
        <h1 className="text-4xl font-black text-slate-900 mt-2">Pioneering Compassionate Healthcare Since 2005</h1>
        <p className="text-slate-600 mt-4 text-base leading-relaxed">
          CarePoint Hospital is a multi-specialty tertiary care center dedicated to world-class clinical acumen, patient safety protocols, and cutting-edge healthcare technology.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            To be recognized nationally and globally as the most trusted healthcare institution, delivering ethical, accessible, and revolutionary clinical care across all demographics.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            To alleviate suffering and preserve human life through evidence-based medicine, innovative medical technologies, continuous academic research, and personalized patient empathy.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <h2 className="text-2xl font-black text-slate-900 text-center">Our Core Pillars of Excellence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Patient Centricity', desc: 'Putting patient comfort, dignity, and recovery at the heart of every clinical decision.' },
            { title: 'Clinical Integrity', desc: 'Unwavering commitment to transparent diagnoses, ethical billing, and medical honesty.' },
            { title: 'Zero Delay Triage', desc: 'Swift emergency protocols ensuring critical trauma patients receive care within minutes.' },
            { title: 'Modern Infrastructure', desc: 'Equipped with 3T MRI, 128-Slice CT, robotic surgical suites, and sterile laminar airflow OTs.' },
            { title: 'Academic Research', desc: 'Active clinical trials and continuous medical education for nursing and medical practitioners.' },
            { title: 'Digital Health Records', desc: 'Seamless computerized medical records allowing patients safe instant access anywhere.' }
          ].map((v, i) => (
            <div key={i} className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{v.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
