import React from 'react';
import { BarChart2, RotateCcw } from 'lucide-react';

interface ActionPanelProps {
    onRunAnalysis: () => void;
    onReset: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
    onRunAnalysis,
    onReset
}) => {
    return (
        <div className="
            flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3

            px-4 sm:px-6 py-3 sm:py-4

            bg-white/60 backdrop-blur-xl
            border-t border-white/30
        ">

            {/* BUTTON GROUP */}
            <div className="
                grid grid-cols-2 gap-3

                w-full
                sm:w-auto
                sm:min-w-[260px]
            ">

                {/* RUN */}
                <button
                    data-interactive-id="btn-report"
                    onClick={onRunAnalysis}
                    className="
                        h-10 flex items-center justify-center gap-2 
                        rounded-xl 
                        bg-blue-600 text-white text-sm font-medium
                        shadow-[0_4px_12px_rgba(37,99,235,0.3)]
                        hover:bg-blue-700 
                        active:scale-[0.97]
                        transition-all duration-200
                    "
                >
                    <BarChart2 className="w-4 h-4" />
                    Run
                </button>

                {/* RESET */}
                <button
                    data-interactive-id="btn-reset"
                    onClick={onReset}
                    className="
                        h-10 flex items-center justify-center gap-2 
                        rounded-xl 
                        bg-white/70 backdrop-blur-md
                        border border-white/50
                        text-sm font-medium text-slate-600
                        shadow-[0_2px_8px_rgba(0,0,0,0.05)]
                        hover:bg-white/90
                        hover:text-slate-800
                        hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                        active:scale-[0.97]
                        transition-all duration-200
                    "
                >
                    <RotateCcw className="w-4 h-4 opacity-70" />
                    Reset
                </button>
            </div>

            {/* STATUS */}
            <div className="
                hidden sm:flex items-center justify-center sm:justify-end
                text-xs text-slate-400
                w-full sm:w-auto
            ">
                Analysis ready
            </div>
        </div>
    );
};