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
            className={`
        fixed 
        top-2 right-2 sm:top-6 sm:right-6

        z-[10002] transition-all duration-500 
        pointer-events-auto flex flex-col 

        rounded-[16px] sm:rounded-[28px]

        bg-white/60 backdrop-blur-2xl
        border border-white/50

        shadow-[0_10px_30px_rgba(0,0,0,0.08),_0_2px_6px_rgba(0,0,0,0.04)]

        w-[140px] sm:w-64 md:w-80
    `}
            onMouseDown={onMouseDown}
        >
            {/* HEADER */}
            <div className="
        h-8 sm:h-14 flex items-center 
        px-2 sm:px-6 justify-between 

        rounded-t-[16px] sm:rounded-t-[28px]

        bg-white/70 backdrop-blur-xl
        border-b border-white/40
    ">
                <TrackingStatus
                    isTrackingLost={isTrackingLost}
                    stabilityScore={stabilityScore}
                    systemStage={systemStage}
                />
            </div>

            {/* CAMERA */}
            <div className="
        relative aspect-video overflow-hidden
        bg-white/40 backdrop-blur-md

        rounded-b-[16px] sm:rounded-b-[28px]

        p-[4px] sm:p-[6px]
    ">
                <div className="
            w-full h-full overflow-hidden 
            rounded-[14px] sm:rounded-[22px]

            border border-white/30
            shadow-inner
        ">
                    <WebcamFeed
                        onFrame={onFrame}
                        minimal
                        className="
                    w-full h-full object-cover
                    brightness-[1.03] contrast-[1.06]
                "
                    />
                </div>

                {/* BADGES */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5 sm:gap-2">
                    <div className="
                px-2 py-[3px] sm:px-3 sm:py-[5px]
                rounded-md sm:rounded-lg

                text-[9px] sm:text-[11px]
                font-semibold tracking-wide

                bg-white/85 backdrop-blur-md
                text-slate-600

                border border-white/50
                shadow-[0_2px_6px_rgba(0,0,0,0.08)]
            ">
                        {currentFps} FPS
                    </div>

                    {gestureType !== 'none' && (
                        <div className="
                    px-2 py-[3px] sm:px-3 sm:py-[5px]
                    rounded-md sm:rounded-lg

                    text-[9px] sm:text-[11px]
                    font-semibold tracking-wide uppercase

                    bg-white/85 backdrop-blur-md
                    text-slate-600

                    border border-white/50
                    shadow-[0_2px_6px_rgba(0,0,0,0.08)]
                ">
                            {gestureType}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
