import React from 'react';
import { ChevronLeft, ChevronRight, Droplets, Heart, Thermometer, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Patient } from '../../constants/patients';

interface PatientPanelProps {
  activePatient: Patient;
  onPrev: () => void;
  onNext: () => void;
}

const conditionColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'critical':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'recovering':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'observation':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    default:
      return 'bg-green-50 text-green-600 border-green-200';
  }
};

export const PatientPanel: React.FC<PatientPanelProps> = ({ activePatient, onPrev, onNext }) => {
  const generateECGPath = () => {
    let path = 'M0 20 ';
    let x = 0;

    while (x < 300) {
      // baseline
      path += `L${x + 10} 20 `;

      // small bump
      path += `L${x + 15} 18 `;

      // spike (heartbeat)
      path += `L${x + 20} 5 `;
      path += `L${x + 25} 35 `;
      path += `L${x + 30} 20 `;

      // recovery
      path += `L${x + 40} 20 `;

      x += 50;
    }

    return path;
  };

  const getECGDuration = (hr: number) => {
    return Math.max(1.8, (60 / hr) * 2.2);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col h-full uppercase">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/40">
        <p className="text-[11px] font-semibold text-slate-500 tracking-widest uppercase">
          Patient Directory
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        {/* Profile */}
        <motion.div
          key={activePatient.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border border-blue-100 shadow-inner">
            <User className="w-10 h-10 text-blue-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#0F172A]">{activePatient.name}</h2>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                ID: {activePatient.id.toUpperCase()}
              </span>

              <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                Age {activePatient.age}
              </span>

              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${conditionColor(activePatient.condition)}`}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 align-middle opacity-70" />
                {activePatient.condition}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Vitals */}
        <div className="space-y-3">
          {/* Heart Rate */}
          <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-between gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-sm font-medium text-slate-600">Heart Rate</span>
            </div>

            <span className="text-sm font-semibold text-blue-600">
              {activePatient.vitals.hr} <span className="text-slate-500 font-medium">BPM</span>
            </span>
          </div>

          {/* REAL ECG - ADVANCED */}
          <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl opacity-40 pointer-events-none" />
            <svg className="w-full h-10" viewBox="0 0 300 40">
              <defs>
                <linearGradient id="ecgGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#2563eb" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <motion.path
                fill="none"
                stroke="url(#ecgGradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: getECGDuration(activePatient.vitals.hr),
                  ease: 'easeInOut',
                  repeat: Infinity
                }}
                style={{
                  filter: 'drop-shadow(0px 0px 8px rgba(37,99,235,0.6))'
                }}
                d={generateECGPath()}
              />
            </svg>
          </div>

          {/* Blood Pressure */}
          <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-between gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-slate-600">Blood Pressure</span>
            </div>
            <span className="text-sm font-semibold text-[#0F172A]">
              {activePatient.vitals.bp}
              <span className="text-xs text-slate-500 ml-1">mmHg</span>
            </span>
          </div>

          {/* Temperature */}
          <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-between gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                <Thermometer className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-slate-600">Temperature</span>
            </div>
            <span className="text-sm font-semibold text-[#0F172A]">
              {activePatient.vitals.temp}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/40 grid grid-cols-2 gap-3">
        <button
          data-interactive-id="btn-prev"
          onClick={onPrev}
          className="h-10 flex items-center justify-center gap-2 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 text-sm font-medium text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-white/90 hover:text-slate-800 transition-all active:scale-[0.97]"
        >
          <ChevronLeft className="w-4 h-4 opacity-70" />
          Prev
        </button>

        <button
          data-interactive-id="btn-next"
          onClick={onNext}
          className="h-10 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
