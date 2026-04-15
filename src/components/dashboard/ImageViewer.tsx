import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImageViewerProps {
    image: string;
    imgScale: number;
    imgOffset: { x: number; y: number };
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
    image,
    imgScale,
    imgOffset
}) => {
    return (
        <>
            <CardHeader className="border-b border-cyan-500/10 bg-cyan-500/5 px-6 py-4">
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest">DIAGNOSTIC_VIEWER</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 industrial-grid opacity-10 pointer-events-none" />
                <motion.img
                    src={image}
                    className="max-w-[90%] max-h-[90%] object-contain brightness-110"
                    animate={{ scale: imgScale, x: imgOffset.x, y: imgOffset.y }}
                    transition={{ type: 'spring', damping: 30 }}
                />
                <div className="absolute bottom-6 left-6 flex gap-4 opacity-50">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-white/10 rounded text-[8px] font-black uppercase tracking-widest">
                        <RefreshCw className="w-3 h-3" /> PALM_RESET
                    </div>
                </div>
            </CardContent>
        </>
    );
};
