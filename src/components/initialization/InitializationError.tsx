import React from 'react';
import { AlertCircle, CameraOff, WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export type ErrorType = 'MODEL_LOAD_FAILED' | 'CAMERA_PERMISSION_DENIED' | 'NETWORK_ERROR' | 'UNKNOWN';

interface InitializationErrorProps {
    type: ErrorType;
    message: string;
    onRetry: () => void;
}

export const InitializationError: React.FC<InitializationErrorProps> = ({ type, message, onRetry }) => {
    const getIcon = () => {
        switch (type) {
            case 'CAMERA_PERMISSION_DENIED':
                return <CameraOff className="w-8 h-8 text-red-500" />;
            case 'NETWORK_ERROR':
                return <WifiOff className="w-8 h-8 text-amber-500" />;
            case 'MODEL_LOAD_FAILED':
                return <AlertCircle className="w-8 h-8 text-red-500" />;
            default:
                return <AlertCircle className="w-8 h-8 text-slate-400" />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'CAMERA_PERMISSION_DENIED':
                return "Camera Access Required";
            case 'NETWORK_ERROR':
                return "Network Connection Issue";
            case 'MODEL_LOAD_FAILED':
                return "AI Engine Load Failed";
            default:
                return "System Initialization Failed";
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-8 text-center"
            >
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                    {getIcon()}
                </div>

                <h1 className="text-2xl font-bold text-[#0F172A] mb-3">{getTitle()}</h1>
                <p className="text-[#64748B] text-sm leading-relaxed mb-8">
                    {message}
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Potential Troubleshooting</p>
                    <ul className="text-xs text-slate-600 space-y-2">
                        <li className="flex gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            Ensure your webcam is connected and the browser has permission.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            Check your internet connection or disable ad-blockers for this site.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            Try using Chrome or Edge for the best experience.
                        </li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={onRetry}
                        className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="h-12 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Reload
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
