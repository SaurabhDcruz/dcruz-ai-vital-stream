import React from 'react';

interface TrackingStatusProps {
  isTrackingLost: boolean;
  stabilityScore: number;
  systemStage?: 'test' | 'dashboard';
}

export const TrackingStatus: React.FC<TrackingStatusProps> = ({
  isTrackingLost,
  stabilityScore
}) => {
  return (
    <div className="flex items-center gap-2.5 relative z-10 w-full">
      <div
        className={`w-2 h-2 rounded-full transition-colors duration-300 ${isTrackingLost ? 'bg-red-500' : 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/15'}`}
      />
      <span className="text-[11px] font-bold tracking-tight text-slate-600">Live Tracking</span>
      <div className="ml-auto">
        <span className="text-[11px] font-bold font-mono text-slate-400">{stabilityScore}%</span>
      </div>
    </div>
  );
};
