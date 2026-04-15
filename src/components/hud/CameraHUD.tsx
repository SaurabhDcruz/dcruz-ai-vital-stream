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
            className={`fixed z-[10002] transition-all duration-700 pointer-events-auto ${systemStage === 'test' ? 'w-64 md:w-80' : 'w-48 md:w-72'}`}
            onMouseDown={onMouseDown}
        >
            <div className="h-8 bg-slate-900 border border-slate-800 rounded-t-lg flex items-center px-4 justify-between relative overflow-hidden">
                <div className="absolute inset-0 scanline-bg opacity-20" />
                <TrackingStatus isTrackingLost={isTrackingLost} stabilityScore={stabilityScore} />
            </div>
            <div className="relative aspect-video overflow-hidden border border-slate-800 rounded-b-xl tech-hud-border">
                <WebcamFeed onFrame={onFrame} minimal className="w-full h-full bg-slate-900 opacity-80" />
                <div className="corner-tr" /><div className="corner-bl" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                    <div className="px-1.5 py-0.5 bg-slate-950/60 rounded text-[7px] font-black text-cyan-400 data-font">{currentFps} FPS</div>
                    <div className="px-1.5 py-0.5 bg-slate-950/60 rounded text-[7px] font-black text-cyan-400 data-font">{gestureType}</div>
                </div>
            </div>
        </div>
    );
};
