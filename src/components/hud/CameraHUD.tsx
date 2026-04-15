import React from 'react';
import { WebcamFeed } from '../WebcamFeed';
import { TrackingStatus } from './TrackingStatus';

interface CameraHUDProps {
    hudRef: React.RefObject<HTMLDivElement | null>;
    onFrame: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    systemStage: 'test' | 'dashboard';
    isTrackingLost: boolean;
    stabilityScore: number;
    currentFps: number;
    gestureType: string;
}

export const CameraHUD: React.FC<CameraHUDProps> = ({
    hudRef,
    onFrame,
    onMouseDown,
    systemStage,
    isTrackingLost,
    stabilityScore,
    currentFps,
    gestureType
}) => {
    return (
        <div
            ref={hudRef}
            className={`fixed top-3 right-3 sm:top-6 sm:right-6 z-[10002] transition-all duration-700 pointer-events-auto flex flex-col rounded-[18px] sm:rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${systemStage === 'test' ? 'w-40 sm:w-64 md:w-80' : 'w-32 sm:w-48 md:w-72'}`}
            onMouseDown={onMouseDown}
        >
            <div className="h-10 sm:h-14 flex items-center px-3 sm:px-6 justify-between relative rounded-t-[18px] sm:rounded-t-[28px] border-x border-t border-white/40 bg-gradient-to-b from-white/80 to-white/50 backdrop-blur-xl">
                <TrackingStatus isTrackingLost={isTrackingLost} stabilityScore={stabilityScore} systemStage={systemStage} />
            </div>
            <div className="relative aspect-video overflow-hidden border-x border-b border-white/40 bg-white/40 backdrop-blur-md rounded-b-[18px] sm:rounded-b-[28px] p-1">
                <div className="w-full h-full overflow-hidden rounded-[20px]">
                    <WebcamFeed
                        onFrame={onFrame}
                        minimal
                        className="w-full h-full object-cover brightness-[1.02] contrast-[1.05]"
                    />
                </div>

                <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wide shadow-sm border bg-white/80 text-slate-600 border-white/50 backdrop-blur-sm">
                        {currentFps} FPS
                    </div>
                    {gestureType !== 'none' && (
                        <div className="px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wide shadow-sm border uppercase bg-white/80 text-slate-600 border-white/50 backdrop-blur-sm">
                            {gestureType}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
