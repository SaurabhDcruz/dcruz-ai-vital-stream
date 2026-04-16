import React from 'react';
import { motion } from 'motion/react';
import { ZoomIn } from 'lucide-react';

interface ImageViewerProps {
  image: string;
  viewState: { scale: number; x: number; y: number };
  isZooming: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, viewState, isZooming }) => {
  return (
    <div className={`relative w-full h-full flex flex-col transition-all duration-500 ${isZooming ? 'bg-blue-50/20' : ''}`}>
      {/* Viewer Header */}
      <div className="px-5 py-4 border-b border-white/40 bg-white/60 backdrop-blur-xl flex items-center justify-between">
        <p className="text-sm font-medium tracking-wide text-slate-600">Diagnostic Viewer</p>

        <span className="text-xs text-slate-400">Gesture-controlled</span>
      </div>

      {/* Image Area */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-slate-100/60 flex items-center justify-center overflow-hidden min-h-[380px]">
        {/* Soft grid (FIXED) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)',
            backgroundSize: '26px 26px'
          }}
        />

        {/* Subtle ambient overlay */}
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />

        {/* Bottom vignette (premium feel) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />

        <motion.img
          src={image}
          className="relative max-w-[92%] max-h-[92%] object-contain rounded-[18px] shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-transform duration-300"
          animate={{
            scale: viewState.scale,
            x: viewState.x,
            y: viewState.y
          }}
          transition={{
            type: 'spring',
            damping: 28,
            stiffness: 180
          }}
          draggable={false}
        />

        {/* Zoom indicator (FIXED PREMIUM) */}
        <motion.div
          animate={isZooming ? { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
        >
          <ZoomIn className={`w-3.5 h-3.5 ${isZooming ? 'text-blue-500' : 'text-slate-500'}`} />
          <span className={`text-xs font-medium ${isZooming ? 'text-blue-600' : 'text-slate-600'}`}>{viewState.scale.toFixed(1)}x</span>
        </motion.div>
      </div>
    </div>
  );
};
