'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
    const [show, setShow] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade out after 1.5 seconds
        const timer1 = setTimeout(() => {
            setFadeOut(true);
        }, 1500);

        // Remove from DOM after transition (1500 + 700 = 2200)
        const timer2 = setTimeout(() => {
            setShow(false);
        }, 2200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F9F9F7] transition-opacity duration-700 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 animate-pulse">
                <Image
                    src="/logo.png"
                    alt="Avanyaa Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>
    );
}
