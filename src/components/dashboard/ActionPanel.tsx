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
        <div className="h-20 bg-slate-950 border-t border-cyan-500/15 p-4 flex gap-4">
            <Button
                data-interactive-id="btn-report"
                onClick={onRunAnalysis}
                className="flex-1 bg-cyan-600/10 border-cyan-500/20 text-cyan-400 font-black text-[10px] uppercase"
            >
                RUN_ANALYSIS
            </Button>
            <Button
                data-interactive-id="btn-reset"
                onClick={onReset}
                className="flex-1 bg-slate-900 border-slate-700 text-slate-500 font-black text-[10px] uppercase"
            >
                RESET
            </Button>
        </div>
    );
};
