import React from 'react';

interface TrackingStatusProps {
    isTrackingLost: boolean;
    stabilityScore: number;
}

export const TrackingStatus: React.FC<TrackingStatusProps> = ({
    isTrackingLost,
    stabilityScore
}) => {
    return (
        <div className="flex items-center gap-2 relative z-10">
            <div className={`w-1.5 h-1.5 rounded-full ${isTrackingLost ? 'bg-red-500' : 'bg-cyan-500 animate-pulse'}`} />
            <span className="text-[8px] font-black uppercase text-white/90">LIVE_FEED</span>
            <div className="text-[8px] font-black text-cyan-500/70 data-font ml-2">{stabilityScore}%</div>
        </div>
    );
};
