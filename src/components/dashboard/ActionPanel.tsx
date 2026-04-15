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
        <div className="px-5 py-4 border-t border-[#E2E8F0] bg-white flex items-center gap-3">
            <button
                data-interactive-id="btn-report"
                onClick={onRunAnalysis}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm"
            >
                <BarChart2 className="w-4 h-4" />
                Run Analysis
            </button>
            <button
                data-interactive-id="btn-reset"
                onClick={onReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] active:scale-[0.98] transition-all duration-200"
            >
                <RotateCcw className="w-4 h-4" />
                Reset View
            </button>
        </div>
    );
};
