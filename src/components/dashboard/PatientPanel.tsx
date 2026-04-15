import React from 'react';
import { Activity, ChevronLeft, ChevronRight, Droplets, Heart, Thermometer, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Patient } from '../../constants/patients';

interface PatientPanelProps {
    activePatient: Patient;
    onPrev: () => void;
    onNext: () => void;
}

const conditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
        case 'critical': return 'bg-red-50 text-red-600 border-red-100';
        case 'recovering': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'observation': return 'bg-blue-50 text-blue-600 border-blue-100';
        default: return 'bg-green-50 text-green-600 border-green-100';
    }
};

export const PatientPanel: React.FC<PatientPanelProps> = ({
    activePatient,
    onPrev,
    onNext
}) => {
    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-full">

            {/* Panel Header */}
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#64748B] tracking-wide uppercase">Patient Directory</p>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-5">

                {/* Profile Section */}
                <motion.div
                    key={activePatient.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-4 text-center"
                >
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100">
                        <User className="w-10 h-10 text-blue-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-[#0F172A]">{activePatient.name}</h2>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span className="text-xs font-medium px-2.5 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded-full border border-[#E2E8F0]">
                                ID: {activePatient.id.toUpperCase()}
                            </span>
                            <span className="text-xs font-medium px-2.5 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded-full border border-[#E2E8F0]">
                                Age {activePatient.age}
                            </span>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${conditionColor(activePatient.condition)}`}>
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 align-middle opacity-70" />
                                {activePatient.condition}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Vitals */}
                <div className="space-y-2.5">
                    {/* Heart Rate with mini sparkline */}
                    <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                                <Heart className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="text-sm font-medium text-[#64748B]">Heart Rate</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{activePatient.vitals.hr} <span className="font-medium text-[#64748B]">BPM</span></span>
                    </div>

                    {/* Mini ECG sparkline */}
                    <div className="px-3.5 py-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden">
                        <motion.div className="w-full" animate={{ x: [-20, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
                            <svg className="w-[110%] h-9 opacity-40" viewBox="0 0 200 36">
                                <path d="M 0 18 L 20 18 L 30 4 L 38 30 L 44 18 L 60 18 L 80 18 L 90 4 L 98 30 L 104 18 L 120 18 L 140 18 L 150 4 L 158 30 L 164 18 L 200 18" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Blood Pressure */}
                    <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                                <Droplets className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-[#64748B]">Blood Pressure</span>
                        </div>
                        <span className="text-sm font-bold text-[#0F172A]">{activePatient.vitals.bp} <span className="text-[10px] font-medium text-[#64748B]">mmHg</span></span>
                    </div>

                    {/* Temperature */}
                    <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                                <Thermometer className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-sm font-medium text-[#64748B]">Temperature</span>
                        </div>
                        <span className="text-sm font-bold text-[#0F172A]">{activePatient.vitals.temp}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="px-5 py-4 border-t border-[#E2E8F0] grid grid-cols-2 gap-3">
                <button
                    data-interactive-id="btn-prev"
                    onClick={onPrev}
                    className="h-10 flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-all duration-200"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                </button>
                <button
                    data-interactive-id="btn-next"
                    onClick={onNext}
                    className="h-10 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
