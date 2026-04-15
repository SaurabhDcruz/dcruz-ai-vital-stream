import React from 'react';
import { motion } from 'motion/react';

export const BackgroundAmbient: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden"
            style={{ background: 'radial-gradient(circle at center, #F8FBFF 0%, #EEF3FF 100%)' }}>

            {/* Ambient Glow Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-400/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 blur-[120px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/40 blur-[80px] rounded-full" />

            {/* Floating Particles */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-blue-300/30"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.2 + 0.1
                    }}
                    animate={{
                        x: [
                            Math.random() * window.innerWidth,
                            Math.random() * window.innerWidth
                        ],
                        y: [
                            Math.random() * window.innerHeight,
                            Math.random() * window.innerHeight
                        ],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: Math.random() * 20 + 6,
                        height: Math.random() * 20 + 6,
                    }}
                />
            ))}
        </div>
    );
};
