import React from 'react';
import { motion } from 'motion/react';

interface CursorProps {
  cursorRef: React.RefObject<HTMLDivElement | null>;
  rawCursorRef: React.RefObject<HTMLDivElement | null>;
  debugMode: boolean;
  isZooming: boolean;
}

export const Cursor: React.FC<CursorProps> = ({ cursorRef, rawCursorRef, debugMode, isZooming }) => {
  return (
    <>
      {/* Premium Glass Cursor */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-7 h-7 pointer-events-none z-[9999] flex items-center justify-center rounded-full backdrop-blur-sm bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/40 transition-all duration-300 ${isZooming ? 'scale-[1.8]' : ''}`}
      >
        {/* Inner Ring */}
        <div className={`w-5 h-5 rounded-full border border-blue-400/30 flex items-center justify-center transition-all duration-300 ${isZooming ? 'border-blue-400/60' : ''}`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-300 ${isZooming ? 'scale-150 bg-blue-600' : ''}`} />
        </div>

        {/* Zoom Indicator Glow */}
        {isZooming && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-blue-400 rounded-full blur-md"
          />
        )}
      </div>

      {debugMode && (
        <div
          ref={rawCursorRef}
          className="fixed top-0 left-0 w-2 h-2 bg-red-400 rounded-full pointer-events-none z-[10000] opacity-50"
        />
      )}
    </>
  );
};
