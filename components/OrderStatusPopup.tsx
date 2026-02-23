'use client';

import { useEffect, useState } from 'react';

type PopupType = 'placed' | 'cancelled';

interface Props {
    type: PopupType;
    /** Called once the exit animation finishes */
    onDone?: () => void;
    /** Auto-dismiss after ms (default 2400) */
    duration?: number;
}

const CONFIG = {
    placed: {
        ring: 'bg-emerald-500/20',
        circle: 'bg-emerald-500',
        icon: (
            /* animated SVG checkmark */
            <svg viewBox="0 0 52 52" className="w-10 h-10" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline
                    points="14,26 22,34 38,18"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    style={{
                        strokeDasharray: 48,
                        strokeDashoffset: 48,
                        animation: 'drawCheck 0.45s 0.25s cubic-bezier(.65,0,.45,1) forwards',
                    }}
                />
            </svg>
        ),
        title: 'Order Placed!',
        subtitle: 'Your order is confirmed.',
        titleColor: 'text-emerald-600 dark:text-emerald-400',
    },
    cancelled: {
        ring: 'bg-red-500/20',
        circle: 'bg-red-500',
        icon: (
            /* animated SVG cross */
            <svg viewBox="0 0 52 52" className="w-10 h-10" fill="none" strokeLinecap="round">
                <line x1="18" y1="18" x2="34" y2="34" stroke="white" strokeWidth="4"
                    style={{
                        strokeDasharray: 23,
                        strokeDashoffset: 23,
                        animation: 'drawLine1 0.3s 0.2s ease forwards',
                    }} />
                <line x1="34" y1="18" x2="18" y2="34" stroke="white" strokeWidth="4"
                    style={{
                        strokeDasharray: 23,
                        strokeDashoffset: 23,
                        animation: 'drawLine2 0.3s 0.38s ease forwards',
                    }} />
            </svg>
        ),
        title: 'Order Cancelled',
        subtitle: 'Your order has been cancelled.',
        titleColor: 'text-red-600 dark:text-red-400',
    },
};

export default function OrderStatusPopup({ type, onDone, duration = 2400 }: Props) {
    const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
    const cfg = CONFIG[type];

    useEffect(() => {
        // enter → visible after a tick (let CSS paint first)
        const t1 = setTimeout(() => setPhase('visible'), 50);
        // visible → exit
        const t2 = setTimeout(() => setPhase('exit'), duration);
        // call onDone after exit animation finishes (~350 ms)
        const t3 = setTimeout(() => onDone?.(), duration + 380);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [duration, onDone]);

    const backdropOpacity = phase === 'visible' ? 'opacity-100' : 'opacity-0';
    const contentTransform = phase === 'visible' ? 'scale-100 opacity-100' : 'scale-75 opacity-0';

    return (
        <>
            {/* Keyframe styles injected once */}
            <style>{`
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawLine1 {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawLine2 {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ripple {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes ripple2 {
          0%   { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${backdropOpacity}`}
            >
                {/* Card */}
                <div
                    className={`flex flex-col items-center gap-5 rounded-3xl border border-border bg-card px-10 py-10 shadow-2xl transition-all duration-300 ${contentTransform}`}
                >
                    {/* Ripple rings + icon */}
                    <div className="relative flex items-center justify-center w-24 h-24">
                        {/* outer ripple */}
                        <span
                            className={`absolute inset-0 rounded-full ${cfg.ring}`}
                            style={{ animation: 'ripple2 1.2s 0.1s ease-out infinite' }}
                        />
                        {/* inner ripple */}
                        <span
                            className={`absolute inset-0 rounded-full ${cfg.ring}`}
                            style={{ animation: 'ripple 1.1s 0.05s ease-out infinite' }}
                        />
                        {/* solid circle */}
                        <span className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${cfg.circle} shadow-lg`}>
                            {cfg.icon}
                        </span>
                    </div>

                    {/* Text */}
                    <div className="text-center space-y-1">
                        <p className={`text-xl font-heading font-bold ${cfg.titleColor}`}>{cfg.title}</p>
                        <p className="text-sm text-muted-foreground">{cfg.subtitle}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
