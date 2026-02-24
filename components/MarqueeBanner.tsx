'use client';

import { useEffect, useRef } from 'react';

const MESSAGES = [
    '✨ Free Shipping on Orders Above ₹999',
    '🛡️ 7-Day Easy Returns',
    '💳 Cash on Delivery Available',
    '📦 Pan-India Delivery',
    '🌸 New Arrivals Every Week',
    '✨ Free Shipping on Orders Above ₹999',
    '🛡️ 7-Day Easy Returns',
    '💳 Cash on Delivery Available',
    '📦 Pan-India Delivery',
    '🌸 New Arrivals Every Week',
];

export default function MarqueeBanner() {
    return (
        <div className="w-full overflow-hidden bg-primary text-primary-foreground py-2.5 select-none">
            <div className="flex whitespace-nowrap animate-marquee">
                {MESSAGES.map((msg, i) => (
                    <span key={i} className="inline-flex items-center gap-2 text-sm font-medium px-8">
                        {msg}
                        <span className="opacity-40 mx-2">•</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
