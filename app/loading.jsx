'use client'

import { Sparkles } from 'lucide-react'
import Image from 'next/image'

// FastGas Official Logo
const FASTGAS_LOGO_URL = 'https://fast-gas.com/wp-content/themes/common/src/assets/images/fast-gas-logo.svg'

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                {/* Gradient Orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="text-center relative z-10">
                {/* Main Logo Animation */}
                <div className="mb-10 flex justify-center">
                    <div className="relative">
                        {/* Outer Rotating Ring */}
                        <div className="absolute -inset-8 rounded-full border-2 border-dashed border-cyan-500/30 animate-spin-slow"></div>
                        
                        {/* Inner Rotating Ring */}
                        <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/40 animate-spin-reverse"></div>
                        
                        {/* Logo Container with Glow */}
                        <div className="relative p-6">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-50 animate-pulse-glow"></div>
                            
                            {/* FastGas Logo */}
                            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-float">
                                <Image 
                                    src={FASTGAS_LOGO_URL}
                                    alt="FastGas"
                                    width={200}
                                    height={80}
                                    className="relative z-10"
                                    priority
                                    unoptimized
                                />
                            </div>
                        </div>
                        
                        {/* Orbiting Sparkle */}
                        <div className="absolute inset-0 animate-orbit">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                                <div className="animate-sparkle">
                                    <Sparkles className="w-6 h-6 text-cyan-400" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative Dots */}
                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-400 rounded-full animate-ping-slow"></div>
                        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-ping-slow" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="animate-fade-in">
                    <h2 className="text-3xl font-bold mb-3 tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                            Loading FastGas
                        </span>
                    </h2>
                    <p className="text-white/60 text-sm mb-8">
                        Premium N₂O for culinary excellence
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-xs mx-auto animate-slide-up">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner relative backdrop-blur-sm">
                        <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full shadow-lg animate-loading-progress"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>

                    {/* Loading Dots */}
                    <div className="flex justify-center items-center gap-2 mt-5">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce-dot"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce-dot" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce-dot" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }

                @keyframes orbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes orbit-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }

                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }

                @keyframes sparkle {
                    0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    50% { transform: scale(1.3) rotate(180deg); opacity: 0.7; }
                }

                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 1; }
                    75%, 100% { transform: scale(2); opacity: 0; }
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes loading-progress {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }

                @keyframes bounce-dot {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 1; }
                }

                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }

                .animate-spin-reverse {
                    animation: spin-reverse 2s linear infinite;
                }

                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }

                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }

                .animate-orbit {
                    animation: orbit 4s linear infinite;
                }

                .animate-orbit-reverse {
                    animation: orbit-reverse 3s linear infinite;
                }

                .animate-bounce-subtle {
                    animation: bounce-subtle 1.5s ease-in-out infinite;
                }

                .animate-sparkle {
                    animation: sparkle 2s ease-in-out infinite;
                }

                .animate-ping-slow {
                    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                    animation-delay: 0.2s;
                    opacity: 0;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                    animation-delay: 0.4s;
                    opacity: 0;
                }

                .animate-loading-progress {
                    animation: loading-progress 1.8s ease-in-out infinite;
                }

                .animate-shimmer {
                    animation: shimmer 1.5s linear infinite;
                }

                .animate-bounce-dot {
                    animation: bounce-dot 1s ease-in-out infinite;
                }

                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    )
}
