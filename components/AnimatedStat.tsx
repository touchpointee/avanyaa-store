'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
    value: string;   // e.g. "5,000+", "4.8★", "7-Day"
    label: string;
    className?: string;
    labelClassName?: string;
}

/** Parse a value string into { number, prefix, suffix } */
function parse(value: string) {
    // Match optional prefix, a float/int (with optional comma), and a suffix
    const m = value.match(/^([^\d]*)([0-9,]+\.?[0-9]*)(.*)$/);
    if (!m) return { num: null, prefix: '', suffix: value };
    const num = parseFloat(m[2].replace(/,/g, ''));
    return { num, prefix: m[1], suffix: m[3] };
}

/** Format number back with commas if original had them */
function fmt(n: number, hasComma: boolean, isFloat: boolean): string {
    if (isFloat) return n.toFixed(1);
    const rounded = Math.round(n);
    if (hasComma) return rounded.toLocaleString('en-IN');
    return String(rounded);
}

export default function AnimatedStat({ value, label, className = '', labelClassName = '' }: Props) {
    const { num, prefix, suffix } = parse(value);
    const [display, setDisplay] = useState<string>(num !== null ? `${prefix}0${suffix}` : value);
    const ref = useRef<HTMLDivElement>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (num === null) return;

        const hasComma = value.includes(',');
        const isFloat = value.includes('.');
        const duration = 1600; // ms
        const fps = 60;
        const steps = Math.round((duration / 1000) * fps);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || hasStarted.current) return;
                hasStarted.current = true;
                observer.disconnect();

                let step = 0;
                const interval = setInterval(() => {
                    step++;
                    // Ease-out cubic: fast start, slow end
                    const progress = 1 - Math.pow(1 - step / steps, 3);
                    const current = num * progress;
                    setDisplay(`${prefix}${fmt(current, hasComma, isFloat)}${suffix}`);
                    if (step >= steps) {
                        clearInterval(interval);
                        setDisplay(value); // ensure exact final value
                    }
                }, duration / steps);
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [num, value, prefix, suffix]);

    return (
        <div ref={ref} className="flex flex-col items-center text-center">
            <span className={`font-heading font-bold tabular-nums transition-none ${className}`}>
                {display}
            </span>
            <span className={`mt-1 ${labelClassName}`}>{label}</span>
        </div>
    );
}
