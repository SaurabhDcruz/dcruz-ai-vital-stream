import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldCheck, Zap, Laptop, Brain, HeartPulse, Fingerprint } from 'lucide-react';

interface CinematicOverlayProps {
    onComplete: () => void;
}

const Particle = ({ i }: { i: number }) => {
    const customX = useMemo(() => Math.random() * 100, []);
    const customY = useMemo(() => Math.random() * 100, []);
    const duration = useMemo(() => 10 + Math.random() * 20, []);
    const delay = useMemo(() => Math.random() * 5, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: `${customX}%`, y: `${customY}%` }}
            animate={{
                opacity: [0, 0.5, 0],
                y: [`${customY}%`, `${customY - 10}%`],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear"
            }}
            className="absolute w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
        />
    );
};

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [scanPos, setScanPos] = useState(-20);

    const onCompleteRef = React.useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 800),   // AI Core
            setTimeout(() => setStep(2), 2000),  // Bio-Auth
            setTimeout(() => setStep(3), 3200),  // Final Link
            setTimeout(() => setStep(4), 4500),  // Reveal
            setTimeout(() => onCompleteRef.current(), 5500)         // Finish
        ];

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.2,
                filter: 'brightness(3) blur(20px)',
            }}
            transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
            className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col items-center justify-center overflow-hidden font-sans"
        >
            {/* 1. Deep Background - Grid & Particles */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.4]" />
                {[...Array(30)].map((_, i) => <Particle i={i} />)}
            </div>

            {/* 2. Scanning Beam */}
            <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-40 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent z-10 pointer-events-none"
            >
                <div className="w-full h-[2px] bg-blue-400 shadow-[0_0_20px_#3b82f6]" />
            </motion.div>

            {/* 3. Tech Readouts (Corners) */}
            <div className="absolute top-8 left-8 z-20 font-mono text-[9px] text-blue-600/60 leading-tight">
                <div>SYS_VERSION: 4.2.0-STABLE</div>
                <div>KERNEL_LINK: ESTABLISHED</div>
                <div>SEC_PROTO: RSA_4096_V3</div>
            </div>
            <div className="absolute top-8 right-8 z-20 font-mono text-[9px] text-blue-600/60 text-right">
                <div>Uptime: 0.0004s</div>
                <div>Bandwidth: 1.2GB/s</div>
                <div>Nodes: Active (14)</div>
            </div>
            <div className="absolute bottom-8 left-8 z-20 flex gap-4">
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <div className="font-mono text-[9px] text-blue-600/60 uppercase">System Integrity: 100%</div>
            </div>

            {/* 4. Main Sequence Content */}
            <div className="relative z-30 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {step < 4 ? (
                        <motion.div
                            key="content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            {/* Central Dynamic Ring */}
                            <div className="relative w-40 h-40 flex items-center justify-center mb-10">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-[3px] border-dashed border-blue-200 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 border-[2px] border-blue-500/30 rounded-full border-t-blue-600"
                                />

                                <motion.div
                                    key={step}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                    className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] relative z-10"
                                >
                                    {step === 0 && <Brain className="text-white w-10 h-10" />}
                                    {step === 1 && <Fingerprint className="text-white w-10 h-10" />}
                                    {step === 2 && <HeartPulse className="text-white w-10 h-10" />}
                                    {step === 3 && <Activity className="text-white w-10 h-10" />}
                                </motion.div>

                                {/* Shockwaves on step change */}
                                <motion.div
                                    key={`wave-${step}`}
                                    initial={{ scale: 0.8, opacity: 0.5 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{ duration: 1 }}
                                    className="absolute inset-0 border-2 border-blue-500 rounded-full pointer-events-none"
                                />
                            </div>

                            {/* Status Labels */}
                            <div className="flex flex-col items-center gap-3">
                                <motion.div
                                    key={`label-${step}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center"
                                >
                                    <div className="text-blue-600 font-black tracking-[0.2em] text-sm mb-1">
                                        {step === 0 && "SYNCHRONIZING AI CORES"}
                                        {step === 1 && "AUTHENTICATING BIO-METRICS"}
                                        {step === 2 && "CALIBRATING VITAL FEED"}
                                        {step === 3 && "VITALSTREAM ONLINE"}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono tracking-widest opacity-60">
                                        {step === 0 && "NODE_01 ... NODE_12 [ACTIVE]"}
                                        {step === 1 && "ENCRYPTED_ID: " + Math.random().toString(36).substr(2, 9).toUpperCase()}
                                        {step === 2 && "HEART_RATE: 72BPM | BP: 120/80"}
                                        {step === 3 && "REDIRECTING TO DASHBOARD_PRO_V1"}
                                    </div>
                                </motion.div>

                                {/* Modern Progress Bar */}
                                <div className="w-64 h-[2px] bg-slate-100 relative overflow-hidden group">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 4.5, ease: "easeInOut" }}
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_10px_#3b82f6]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reveal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="text-blue-600 font-black text-6xl tracking-tighter mb-4 blur-[0.5px]">
                                READY
                            </div>
                            <motion.div
                                animate={{ width: [0, 200], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8 }}
                                className="h-[1px] bg-blue-600"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 5. Light Sweep (Flash Reveal at the end) */}
            <AnimatePresence>
                {step === 4 && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-white z-[100] origin-center"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
