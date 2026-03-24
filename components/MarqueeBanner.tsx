'use client';

import { useEffect, useState } from 'react';

const DEFAULT_MESSAGES = [
  '✨ Free Shipping on Orders Above ₹999',
  '🛡️ 7-Day Easy Returns',
  '💳 Cash on Delivery Available',
  '📦 Pan-India Delivery',
  '🌸 New Arrivals Every Week',
];

export default function MarqueeBanner() {
  const [messages, setMessages] = useState<string[]>(DEFAULT_MESSAGES);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.marqueeMessages) && data.marqueeMessages.length > 0) {
          setMessages(data.marqueeMessages);
        }
      })
      .catch(() => {});
  }, []);

  // Duplicate messages for seamless infinite scroll
  const displayed = [...messages, ...messages];

  return (
    <div className="w-full overflow-hidden bg-primary text-primary-foreground py-1.5 md:py-2.5 select-none mt-4 md:mt-0 flex items-center">
      <div className="flex whitespace-nowrap animate-marquee">
        {displayed.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-medium px-6 md:px-8">
            {msg}
            <span className="opacity-40 mx-2 md:mx-4">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
