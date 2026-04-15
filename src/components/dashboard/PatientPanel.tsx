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
        <Card className="tech-glass bg-slate-900/40 border-cyan-500/10 overflow-hidden h-full flex flex-col tech-hud-border">
            <CardHeader className="border-b border-cyan-500/10 bg-cyan-500/5 px-6 py-4">
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest">SUBJECT_DIRECTORY</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-950 rounded border border-cyan-500/20 flex items-center justify-center">
                            <User className="w-8 h-8 text-cyan-500/40" />
                        </div>
                        <div>
                            <div className="text-[8px] font-black text-slate-500 uppercase">ID: {activePatient.id}</div>
                            <h2 className="text-xl font-black text-white font-heading uppercase">{activePatient.name}</h2>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-950/40 border border-cyan-500/10 rounded flex justify-between items-center">
                            <span className="text-[8px] font-black text-slate-500">HEART_RATE</span>
                            <span className="text-cyan-400 font-black data-font">{activePatient.vitals.hr} BPM</span>
                        </div>
                        <div className="w-full h-8 bg-cyan-500/5 rounded border border-cyan-500/10 overflow-hidden">
                            <motion.div className="w-full h-full" animate={{ x: [-20, 0] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                <svg className="w-[120%] h-full opacity-30">
                                    <path d="M 0 15 L 20 5 L 40 25 L 60 10 L 80 15 L 100 5 L 120 25" fill="none" stroke="#22d3ee" strokeWidth="2" />
                                </svg>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <div className="p-6 border-t border-cyan-500/10 grid grid-cols-2 gap-4">
                <Button data-interactive-id="btn-prev" onClick={onPrev} className="h-12 bg-slate-900 text-xs font-black uppercase tracking-widest hover:border-cyan-500">PREV</Button>
                <Button data-interactive-id="btn-next" onClick={onNext} className="h-12 bg-slate-900 text-xs font-black uppercase tracking-widest hover:border-cyan-500">NEXT</Button>
            </div>
        </Card>
    );
};
