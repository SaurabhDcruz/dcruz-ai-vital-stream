import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full py-3 px-6 border-t border-[#E2E8F0] bg-white/40 backdrop-blur-xl">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-[#64748B]">
                <div className="flex items-center gap-2 font-medium">
                    <span className="text-[#94A3B8]">All Rights Reserved © {new Date().getFullYear()}</span>
                    <span className="w-1 h-1 rounded-full bg-[#CBD5E1] hidden sm:block" />
                    <div className="flex items-center gap-1.5">
                        <span>Made with</span>
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                        <span>by</span>
                        <a
                            href="https://www.linkedin.com/in/saurabh-dcruz-sd786/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-1 text-[#0F172A] hover:text-blue-600 transition-all duration-300 font-bold"
                        >
                            Saurabh Dcruz
                            <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:text-blue-600 transition-all duration-300" />
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/50 border border-blue-100/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">System Online</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-widest hidden md:inline">Precision Medical Analytics</span>
                </div>
            </div>
        </footer>
    );
};
