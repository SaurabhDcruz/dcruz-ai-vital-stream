import React from 'react';
import { motion } from 'motion/react';
import { Hand, Cpu, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CalibrationScreenProps {
    isStable: boolean;
    stabilityScore: number;
    currentFps: number;
    onAccess: () => void;
}

export const CalibrationScreen: React.FC<CalibrationScreenProps> = ({
    isStable,
    stabilityScore,
    currentFps,
    onAccess
}) => {
    return (
        <div className="fixed inset-0 bg-slate-950 overflow-hidden">
            <div className="absolute inset-0 industrial-grid opacity-20" />
            <div className="absolute inset-0 scanline-bg opacity-30 pointer-events-none" />
            <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-10 pointer-events-none">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-auto">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-10 bg-cyan-500 rounded-full glow-cyan" />
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white font-heading uppercase">
                                VITAL<span className="text-cyan-500">STREAM</span>_OS
                            </h1>
                            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 data-font text-[9px] px-2">v.2.0.4_INDUSTRIAL</Badge>
                        </div>
                        <div className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase ml-5">PRECISION_BIOMETRIC_CALIBRATION_MODULE</div>
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full overflow-visible opacity-40">
                            <motion.circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" strokeDasharray="4 20" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
                            <motion.circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="8" strokeDasharray="2 48" animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
                            <motion.circle cx="50%" cy="50%" r="35%" fill="none" stroke={isStable ? "rgba(16, 185, 129, 0.4)" : "rgba(6, 182, 212, 0.2)"} strokeWidth="2" strokeDasharray="100 100" animate={{ strokeDashoffset: 100 - stabilityScore }} className="transition-colors duration-500" />
                        </svg>
                        <div className="relative z-20 flex flex-col items-center justify-center text-center space-y-6 md:space-y-10">
                            <motion.div className={`w-24 h-24 md:w-40 md:h-40 rounded-full border border-cyan-500/30 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl relative z-21 ${isStable ? 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'shadow-[0_0_40px_rgba(6,182,212,0.1)]'}`} animate={{ scale: isStable ? [1, 1.02, 1] : 1 }} transition={{ duration: 0.5, repeat: isStable ? Infinity : 0 }}>
                                <Hand className={`w-12 h-12 md:w-20 md:h-20 transition-colors duration-500 ${isStable ? 'text-emerald-400' : 'text-cyan-400'}`} />
                            </motion.div>
                            <div className="space-y-2">
                                <h2 className={`text-2xl md:text-4xl font-black font-heading tracking-[0.3em] uppercase transition-colors duration-500 ${isStable ? 'text-emerald-400 glow-cyan' : 'text-cyan-500 glow-cyan'}`}>{isStable ? 'STABILITY_LOCKED' : 'AUTH_SCANNING_...'}</h2>
                                <div className="data-font text-[10px] md:text-[12px] text-slate-500 flex items-center justify-center gap-6 tracking-widest font-bold">
                                    <span className={stabilityScore > 80 ? 'text-emerald-500' : 'text-cyan-400'}>CONFIDENCE: {stabilityScore}%</span>
                                    <span className="text-cyan-400">FPS: {currentFps}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pointer-events-auto">
                    <div className="tech-hud-border p-5 bg-slate-900/60 backdrop-blur-md">
                        <div className="corner-tr" /><div className="corner-bl" />
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-cyan-500" /> SYSTEM_TELEMETRY</div>
                        <div className="space-y-3 data-font text-[11px] font-bold">
                            <div className="flex justify-between"><span className="text-slate-400">LATENCY</span><span className="text-cyan-400">{Math.round(1000 / Math.max(1, currentFps))}ms</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">LOAD</span><span className="text-cyan-400">{(currentFps * 1.2).toFixed(1)}%</span></div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
                                <motion.div className={`h-full ${stabilityScore > 90 ? 'bg-emerald-500' : 'bg-cyan-500'}`} animate={{ width: `${stabilityScore}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="tech-hud-border p-5 bg-slate-900/60 backdrop-blur-md hidden sm:block">
                        <div className="corner-tr" /><div className="corner-bl" />
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Signal className="w-3.5 h-3.5 text-cyan-500" /> SENSOR_INPUT_LOG</div>
                        <div className="space-y-1.5 data-font text-[10px] font-bold">
                            <div className="flex gap-2 text-cyan-500/40"><span>[00:01]</span><span className="text-slate-300">DETECTION_ENGINE_ONLINE</span></div>
                            <div className="flex gap-2 text-cyan-500/40"><span>[00:02]</span><span className={isStable ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}>{isStable ? 'SIGNAL_LOCKED' : 'SIGNAL_SCANNING'}</span></div>
                        </div>
                    </div>
                    <div className="tech-hud-border p-5 bg-slate-900/60 backdrop-blur-md md:col-span-2 overflow-hidden relative group">
                        <div className="corner-tr" /><div className="corner-bl" />
                        <div className="relative z-10 flex flex-col justify-end h-full">
                            <Button data-interactive-id="btn-access" disabled={!isStable} onClick={onAccess} className={`h-12 w-full rounded border transition-all duration-500 font-heading font-black text-[11px] uppercase tracking-[0.3em] ${isStable ? 'bg-cyan-600 border-cyan-400 text-white tech-glow-blue hover:bg-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'}`}>
                                {isStable ? 'ACCESS_SECURE_INTERFACE' : 'WAITING_FOR_SENSOR_LOCK...'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
