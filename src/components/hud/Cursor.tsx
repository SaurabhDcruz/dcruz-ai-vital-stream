import React from 'react';
import { motion } from 'motion/react';

interface CursorProps {
    cursorRef: React.RefObject<HTMLDivElement | null>;
    rawCursorRef: React.RefObject<HTMLDivElement | null>;
    debugMode: boolean;
}

export const Cursor: React.FC<CursorProps> = ({
    cursorRef,
    rawCursorRef,
    debugMode
}) => {
    return (
        <>
            {/* Premium Glass Cursor */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-7 h-7 pointer-events-none z-[9999] flex items-center justify-center rounded-full backdrop-blur-sm bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/40 transition-transform duration-[0.08s] linear"
            >
                {/* Inner Ring */}
                <div className="w-5 h-5 rounded-full border border-blue-400/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                </div>
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
