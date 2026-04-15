import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Cpu, HeartPulse } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PatientPanel } from './PatientPanel';
import { ImageViewer } from './ImageViewer';
import { ActionPanel } from './ActionPanel';
import { Patient } from '../../constants/patients';
import { GestureState } from '../../services/gestureService';

interface DashboardProps {
    activePatient: Patient;
    imgScale: number;
    imgOffset: { x: number; y: number };
    gesture: GestureState;
    debugMode: boolean;
    onDebugToggle: () => void;
    onPrevPatient: () => void;
    onNextPatient: () => void;
    onRunAnalysis: () => void;
    onResetView: () => void;
    isTrackingLost: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
    activePatient,
    imgScale,
    imgOffset,
    gesture,
    debugMode,
    onDebugToggle,
    onPrevPatient,
    onNextPatient,
    onRunAnalysis,
    onResetView,
    isTrackingLost
}) => {
    return (
        <div className="w-full h-full flex flex-col">
            <AnimatePresence>
                {isTrackingLost && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-12 md:bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[10001] bg-slate-900 border border-red-500/30 text-red-500 px-10 py-4 rounded-xl font-black shadow-2xl flex items-center gap-6 tech-glass tech-hud-border"
                    >
                        {/* Keeping original ScanLine icon and text logic */}
                        <div className="w-6 h-6 animate-pulse bg-red-500/20 rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-[0.4em] opacity-60">ALERT_TRACKING_CRITICAL</span>
                            <span className="text-lg uppercase">SIGNAL_LOST</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-[1000] w-full bg-white/70 backdrop-blur-2xl border-b border-blue-500/10 px-6 py-4 flex items-center justify-between">

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-600/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                        <HeartPulse className="text-cyan-400 w-6 h-6 animate-pulse" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase font-heading">
                        VITAL<span className="text-blue-600">STREAM</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <AnimatePresence mode="wait">
                        {gesture.type !== 'none' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                {gesture.type}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={onDebugToggle}
                        className={`p-2.5 rounded-lg border transition-all ${debugMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                        <Cpu className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-6 md:gap-10 min-h-[calc(100vh-5rem)] relative z-10">
                <div className="lg:col-span-4 space-y-6">
                    <PatientPanel activePatient={activePatient} onPrev={onPrevPatient} onNext={onNextPatient} />
                </div>

                <div className="lg:col-span-8">
                    <Card className="bg-white/60 backdrop-blur-xl border-blue-500/10 h-full relative overflow-hidden rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] min-h-[500px] flex flex-col">
                        <ImageViewer image={activePatient.image} imgScale={imgScale} imgOffset={imgOffset} />
                        <ActionPanel onRunAnalysis={onRunAnalysis} onReset={onResetView} />
                    </Card>
                </div>
            </main>
        </div>
    );
};
