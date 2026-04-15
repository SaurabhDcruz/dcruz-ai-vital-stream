import React from 'react';
import { motion } from 'motion/react';
import { ZoomIn } from 'lucide-react';

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
            {/* Viewer Header */}
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0F172A]">Diagnostic Viewer</p>
                <span className="text-xs text-[#64748B]">Gesture-controlled</span>
            </div>

            {/* Image Area */}
            <div className="flex-1 relative bg-[#F8FAFC] flex items-center justify-center overflow-hidden min-h-[380px]">
                {/* Subtle grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.4]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #CBD5E1 1px, transparent 0)',
                        backgroundSize: '28px 28px'
                    }}
                />

                <motion.img
                    src={image}
                    className="relative max-w-[92%] max-h-[92%] object-contain rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)]"
                    animate={{ scale: imgScale, x: imgOffset.x, y: imgOffset.y }}
                    transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                    draggable={false}
                />

                {/* Zoom indicator */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] shadow-sm">
                    <ZoomIn className="w-3.5 h-3.5 text-[#64748B]" />
                    <span className="text-xs font-semibold text-[#64748B]">{imgScale.toFixed(1)}x</span>
                </div>
            </div>
        </>
    );
};
