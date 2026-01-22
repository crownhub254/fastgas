'use client'

import { ShoppingCart, Package, Sparkles } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-100 relative overflow-hidden">
            <div className="text-center relative z-10">
                {/* Main Loading Animation */}
                <div className="mb-10 flex justify-center">
                    <div className="relative w-32 h-32">
                        {/* Rotating Border Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-secondary animate-spin-slow"></div>

                        {/* Secondary Ring */}
                        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-accent border-l-primary animate-spin-reverse"></div>

                        {/* Center Shopping Cart */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl animate-float">
                                    <ShoppingCart className="w-10 h-10 text-white" strokeWidth={2.5} />
                                </div>

                                {/* Glow Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-secondary opacity-50 blur-xl animate-pulse-glow"></div>
                            </div>
                        </div>

                        {/* Orbiting Package Icon */}
                        <div className="absolute inset-0 animate-orbit">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success to-accent flex items-center justify-center shadow-lg animate-bounce-subtle">
                                    <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Orbiting Sparkle Icon */}
                        <div className="absolute inset-0 animate-orbit-reverse">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                                <div className="animate-sparkle">
                                    <Sparkles className="w-7 h-7 text-warning" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Decorative Dots */}
                        <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full animate-ping-slow"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-secondary rounded-full animate-ping-slow" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute top-1/2 right-0 w-2 h-2 bg-accent rounded-full animate-ping-slow" style={{ animationDelay: '1s' }}></div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="animate-fade-in">
                    <h2 className="text-3xl font-bold mb-3 tracking-tight">
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                            Preparing Your Shop
                        </span>
                    </h2>
                    <p className="text-base-content/70 text-sm mb-8">
                        Loading amazing products just for you
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-xs mx-auto animate-slide-up">
                    <div className="h-2 bg-base-300 rounded-full overflow-hidden shadow-inner relative">
                        <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full shadow-lg animate-loading-progress"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>

                    {/* Loading Dots */}
                    <div className="flex justify-center items-center gap-2 mt-5">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot"></div>
                        <div className="w-2 h-2 rounded-full bg-secondary animate-bounce-dot" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce-dot" style={{ animationDelay: '0.4s' }}></div>
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
