import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Patient } from '../../constants/patients';

interface PatientPanelProps {
    activePatient: Patient;
    onPrev: () => void;
    onNext: () => void;
}

export const PatientPanel: React.FC<PatientPanelProps> = ({
    activePatient,
    onPrev,
    onNext
}) => {
    return (
        <Card className="bg-white/60 backdrop-blur-xl border-blue-500/10 overflow-hidden h-full flex flex-col rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <CardHeader className="border-b border-blue-500/5 bg-blue-500/5 px-6 py-4 text-center">
                <CardTitle className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.3em]">SUBJECT_DIRECTORY</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1">
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                            <User className="w-10 h-10 text-blue-600/40" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {activePatient.id}</div>
                            <h2 className="text-2xl font-black text-slate-900 font-heading uppercase tracking-tight">{activePatient.name}</h2>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-[16px] flex justify-between items-center shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">HEART_RATE</span>
                            <span className="text-blue-600 font-black data-font text-lg">{activePatient.vitals.hr} BPM</span>
                        </div>
                        <div className="w-full h-8 bg-blue-500/5 rounded-full border border-blue-500/10 overflow-hidden">
                            <motion.div className="w-full h-full" animate={{ x: [-20, 0] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                <svg className="w-[120%] h-full opacity-20">
                                    <path d="M 0 15 L 20 5 L 40 25 L 60 10 L 80 15 L 100 5 L 120 25" fill="none" stroke="#2563eb" strokeWidth="2" />
                                </svg>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <div className="p-6 border-t border-blue-500/5 grid grid-cols-2 gap-4 bg-blue-50/30">
                <Button data-interactive-id="btn-prev" onClick={onPrev} className="h-12 bg-white text-slate-900 border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm">PREV</Button>
                <Button data-interactive-id="btn-next" onClick={onNext} className="h-12 bg-blue-600 text-white border-blue-500 text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-sm">NEXT</Button>
            </div>
        </Card>
    );
};
