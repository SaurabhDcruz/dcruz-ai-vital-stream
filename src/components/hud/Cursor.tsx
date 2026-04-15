import React from 'react';

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
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9999] flex items-center justify-center border border-blue-500/30 rounded-lg tech-hud-border transition-all duration-200 bg-blue-500/10"
            >
                <div className="w-2 h-2 rounded-full bg-blue-600 tech-glow-blue" />
            </div>

            {debugMode && (
                <div
                    ref={rawCursorRef}
                    className="fixed top-0 left-0 w-2 h-2 bg-red-500 rounded-full pointer-events-none z-[10000] opacity-50"
                />
            )}
        </>
    );
};
