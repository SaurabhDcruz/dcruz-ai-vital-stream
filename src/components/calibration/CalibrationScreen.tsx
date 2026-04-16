import React from 'react';
import { motion } from 'motion/react';
import { Hand } from 'lucide-react';
import BackgroundAmbient from '../BackgroundAmbient';

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
  const circumference = 879.6;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-4 py-16 sm:py-6 overflow-hidden">
      <BackgroundAmbient />

      {/* Container */}
      <div className="flex flex-col items-center justify-center gap-5 sm:gap-8 w-full max-w-sm sm:max-w-lg">
        {/* Main Circle — responsive size */}
        <div className="relative w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] flex items-center justify-center">
          {/* Progress Ring */}
          <svg viewBox="0 0 320 320" className="absolute inset-0 w-full h-full -rotate-90">
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F8CFF" />
                <stop offset="100%" stopColor="#6EA8FF" />
              </linearGradient>
            </defs>
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="12"
              strokeOpacity="0.3"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="url(#blueGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                filter: 'drop-shadow(0 0 4px rgba(79,140,255,0.25))'
              }}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (stabilityScore / 100) * circumference }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>

          {/* Glass Disc */}
          <div className="relative w-[82%] h-[82%] rounded-full bg-white/70 backdrop-blur-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.8)] flex flex-col items-center justify-center p-6 sm:p-12 text-center border border-white/40">
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-2 sm:mb-6"
            >
              <Hand size={40} className="sm:hidden text-[#4F8CFF]" strokeWidth={1.2} />
              <Hand size={64} className="hidden sm:block text-[#4F8CFF]" strokeWidth={1.2} />
            </motion.div>

            <h1 className="text-[#0F172A] text-sm sm:text-xl font-medium tracking-tight opacity-90 leading-snug">
              Scanning Your Hand
            </h1>
          </div>
        </div>

        {/* Latency */}
        <p className="text-[#0F172A] text-xs sm:text-sm font-bold opacity-60 tracking-[0.2em] uppercase">
          LATENCY {latency}ms
        </p>

        {/* Confidence Card */}
        <div className="w-full">
          <div className="relative bg-white/60 backdrop-blur-xl rounded-[22px] p-4 sm:p-6 border border-white/40 shadow-[0_20px_60px_rgba(15,23,42,0.12)] flex items-center gap-4 overflow-hidden">
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-100/20 pointer-events-none" />
            {/* glow */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/20 blur-3xl rounded-full" />

            {/* Small Circular Progress */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                  strokeOpacity="0.25"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="url(#gradientStroke)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 176 }}
                  animate={{ strokeDashoffset: 176 - (stabilityScore / 100) * 176 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ strokeDasharray: 176 }}
                />
                <defs>
                  <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-[#3B82F6] text-[10px] font-semibold tracking-tight">
                {stabilityScore}%
              </span>
            </div>

            {/* Content */}
            <div className="space-y-0.5 flex-1 relative z-10">
              <h3 className="text-[#0F172A] text-sm font-semibold tracking-tight">
                Confidence
                <span className="ml-1 text-blue-500 font-bold">{stabilityScore}%</span>
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
