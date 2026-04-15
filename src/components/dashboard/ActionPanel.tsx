import React from 'react';
import { Button } from '@/components/ui/button';

interface ActionPanelProps {
    onRunAnalysis: () => void;
    onReset: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
    onRunAnalysis,
    onReset
}) => {
    return (
        <div className="h-20 bg-blue-50/50 border-t border-blue-500/10 p-4 flex gap-4">
            <Button
                data-interactive-id="btn-report"
                onClick={onRunAnalysis}
                className="flex-1 bg-blue-600 text-white font-black text-[10px] uppercase shadow-md hover:bg-blue-700"
            >
                RUN_ANALYSIS
            </Button>
            <Button
                data-interactive-id="btn-reset"
                onClick={onReset}
                className="flex-1 bg-white border-slate-200 text-slate-500 font-black text-[10px] uppercase hover:bg-slate-50 shadow-sm"
            >
                RESET
            </Button>
        </div>
    );
};
