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
            flex items-center justify-between gap-3

            px-4 sm:px-6 py-3 sm:py-4

            bg-white/60 backdrop-blur-xl
            border-t border-white/30
        ">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-3">

                {/* RUN ANALYSIS (PRIMARY) */}
                <button
                    data-interactive-id="btn-report"
                    onClick={onRunAnalysis}
                    className="
                        flex items-center gap-2

                        px-4 sm:px-5 py-2.5
                        rounded-xl

                        bg-blue-600 text-white
                        text-sm font-semibold

                        shadow-[0_6px_16px_rgba(37,99,235,0.35)]

                        hover:bg-blue-700
                        hover:shadow-[0_10px_24px_rgba(37,99,235,0.4)]

                        active:scale-[0.97]

                        transition-all duration-200
                    "
                >
                    <BarChart2 className="w-4 h-4" />
                    Run Analysis
                </button>

                {/* RESET (SECONDARY GLASS BUTTON) */}
                <button
                    data-interactive-id="btn-reset"
                    onClick={onReset}
                    className="
                        flex items-center gap-2

                        px-4 sm:px-5 py-2.5
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
                    Reset View
                </button>
            </div>

            {/* RIGHT SIDE (OPTIONAL FUTURE STATUS) */}
            <div className="hidden sm:flex items-center text-xs text-slate-400">
                Analysis ready
            </div>
        </div>
    );
};