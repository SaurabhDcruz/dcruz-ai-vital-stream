import React from 'react';
import { motion } from 'motion/react';
import { Hand } from 'lucide-react';
import { BackgroundAmbient } from '../BackgroundAmbient';

interface CalibrationScreenProps {
    isStable: boolean;
    stabilityScore: number;
    currentFps: number;
    onAccess: () => void;
}

export const CalibrationScreen: React.FC<CalibrationScreenProps> = ({
    stabilityScore,
    currentFps
}) => {
    const latency = Math.round(1000 / Math.max(1, currentFps));

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-6 overflow-hidden">
            <BackgroundAmbient />

            {/* Container for Centered Elements */}
            <div className="flex flex-col items-center justify-center gap-10">

                {/* Main Element - Center Circle */}
                <div className="relative w-[320px] h-[320px] md:w-[360px] md:h-[360px] flex items-center justify-center">
                    {/* Progress Ring */}
                    <svg viewBox="0 0 320 320" className="absolute inset-0 w-full h-full -rotate-90">
                        <defs>
                            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4F8CFF" />
                                <stop offset="100%" stopColor="#6EA8FF" />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="160" cy="160" r="140"
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="6"
                            strokeOpacity="0.3"
                        />
                        <motion.circle
                            cx="160" cy="160" r="140"
                            fill="none"
                            stroke="url(#blueGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            style={{
                                strokeDasharray: 880,
                                filter: 'drop-shadow(0 0 8px rgba(79,140,255,0.4))'
                            }}
                            initial={{ strokeDashoffset: 880 }}
                            animate={{ strokeDashoffset: 880 - (stabilityScore / 100) * 880 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </svg>

                    {/* Glass Disc */}
                    <div className="relative w-[84%] h-[84%] rounded-full bg-gradient-to-b from-white/80 to-white/50 backdrop-blur-[24px] shadow-[0_30px_100px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center p-12 text-center border border-white/50">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="mb-8"
                        >
                            <Hand size={72} className="text-[#4F8CFF]" strokeWidth={1.2} />
                        </motion.div>

                        <h1 className="text-[#0F172A] text-xl font-medium tracking-tight opacity-90">
                            Scanning your hand...
                        </h1>
                    </div>
                </div>

                {/* Telemetry below circle */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-[#0F172A] text-lg font-bold opacity-90 tracking-wide uppercase">
                        LATENCY {latency}ms
                    </p>
                </div>

                {/* Bottom Confidence Card - Now in flow */}
                <div className="w-full max-w-md mt-6">
                    <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white/40 flex items-center gap-8 translate-y-0">
                        {/* Small Circular Progress */}
                        <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeOpacity="0.4" />
                                <motion.circle
                                    cx="32" cy="32" r="28"
                                    fill="none" stroke="#4F8CFF"
                                    strokeWidth="4" strokeLinecap="round"
                                    initial={{ strokeDashoffset: 176 }}
                                    animate={{ strokeDashoffset: 176 - (stabilityScore / 100) * 176 }}
                                    style={{ strokeDasharray: 176 }}
                                />
                            </svg>
                            <span className="text-[#4F8CFF] text-[10px] font-bold">{stabilityScore}%</span>
                        </div>

                        <div className="space-y-1.5 flex-1">
                            <h3 className="text-[#0F172A] text-sm font-bold tracking-tight">
                                Confidence... {stabilityScore}%
                            </h3>
                            <p className="text-[#64748B] text-[11px] font-medium leading-relaxed opacity-80">
                                Keep your hand within the camera frame
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
