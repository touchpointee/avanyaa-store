'use client';

import { Check, Package, PackageCheck, Truck, MapPin, Star, X, RotateCcw } from 'lucide-react';

/* ─── Types ───────────────────────────────────────────────────── */
type OrderStatus =
    | 'placed' | 'packed' | 'shipped'
    | 'out_for_delivery' | 'delivered'
    | 'cancelled' | 'returned' | 'return_requested';

interface Props {
    status: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
    isRefunded?: boolean;
}

/* ─── Step definitions ────────────────────────────────────────── */
const STEPS = [
    { key: 'placed', label: 'Order Placed', Icon: Package },
    { key: 'packed', label: 'Packed', Icon: PackageCheck },
    { key: 'shipped', label: 'Shipped', Icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', Icon: MapPin },
    { key: 'delivered', label: 'Delivered', Icon: Star },
] as const;

const STATUS_ORDER = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

function fmt(d: string | Date) {
    return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

/* ─── Shared circle styles ────────────────────────────────────── */
function circleClass(state: 'done' | 'active' | 'future', hue: 'green' | 'red' | 'orange') {
    if (state === 'done') {
        return hue === 'red' ? 'bg-red-500    border-red-500    text-white'
            : hue === 'orange' ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-emerald-500 border-emerald-500 text-white';
    }
    if (state === 'active') {
        return hue === 'red' ? 'bg-red-50    border-red-500    text-red-600    ring-4 ring-red-100    dark:bg-red-950    dark:ring-red-900'
            : hue === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-600 ring-4 ring-orange-100 dark:bg-orange-950 dark:ring-orange-900'
                : 'bg-emerald-50 border-emerald-500 text-emerald-600 ring-4 ring-emerald-100 dark:bg-emerald-950 dark:ring-emerald-900';
    }
    return 'bg-muted border-border text-muted-foreground';
}

function labelClass(state: 'done' | 'active' | 'future', hue: 'green' | 'red' | 'orange') {
    if (state === 'future') return 'text-muted-foreground';
    return hue === 'red' ? 'font-semibold text-red-600    dark:text-red-400'
        : hue === 'orange' ? 'font-semibold text-orange-600 dark:text-orange-400'
            : 'font-semibold text-emerald-700 dark:text-emerald-400';
}

/* ─── Connector line colour ───────────────────────────────────── */
function connectorBg(done: boolean, hue: 'green' | 'red' | 'orange') {
    if (!done) return 'bg-border';
    return hue === 'red' ? 'bg-red-400' : hue === 'orange' ? 'bg-orange-400' : 'bg-emerald-400';
}

const DASH_STYLE = { backgroundImage: 'repeating-linear-gradient(180deg,#d1d5db 0,#d1d5db 6px,transparent 6px,transparent 12px)', background: 'unset' };
const DASH_H_STYLE = { backgroundImage: 'repeating-linear-gradient(90deg,#d1d5db 0,#d1d5db 6px,transparent 6px,transparent 12px)', background: 'unset' };

/* ════════════════════════════════════════════════════════════════
   Vertical (mobile) step row
════════════════════════════════════════════════════════════════ */
function VStep({
    Icon, label, state, date, hue, isLast, connectorDone,
}: {
    Icon: React.ElementType;
    label: string;
    state: 'done' | 'active' | 'future';
    date?: string;
    hue: 'green' | 'red' | 'orange';
    isLast: boolean;
    connectorDone: boolean;
}) {
    return (
        <div className="flex gap-3">
            {/* Left rail: circle + connecting line */}
            <div className="flex flex-col items-center">
                {/* Circle — sits on the rail */}
                <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${circleClass(state, hue)}`}>
                    {state === 'done' ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                {/* Connector line — flex-1 stretches to fill whatever height the right content needs */}
                {!isLast && (
                    <div
                        className={`w-0.5 flex-1 min-h-[2rem] transition-all duration-500 ${connectorBg(connectorDone, hue)}`}
                        style={connectorDone ? {} : DASH_STYLE}
                    />
                )}
            </div>

            {/* Right: label + date — pb-4 adds space between rows (the line fills this gap) */}
            <div className="pt-2 pb-5">
                <p className={`text-xs leading-tight ${labelClass(state, hue)}`}>{label}</p>
                {date && <p className="text-[10px] text-muted-foreground mt-0.5">{date}</p>}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   Horizontal (desktop) step node + connector
════════════════════════════════════════════════════════════════ */
function HStep({ Icon, label, state, date, hue }: {
    Icon: React.ElementType; label: string; state: 'done' | 'active' | 'future'; date?: string; hue: 'green' | 'red' | 'orange';
}) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${circleClass(state, hue)}`}>
                {state === 'done' ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className={`text-xs text-center leading-tight max-w-[72px] ${labelClass(state, hue)}`}>{label}</span>
            {date && <span className="text-[10px] text-muted-foreground text-center">{date}</span>}
        </div>
    );
}

/** Horizontal connector — sits between two HStep nodes, aligned to circle centre (circle = 40px → top offset = 20px = mt-5 - 1px) */
function HConnector({ done, hue }: { done: boolean; hue: 'green' | 'red' | 'orange' }) {
    return (
        <div className="flex-1 flex items-start pt-[19px]">
            <div
                className={`w-full h-0.5 transition-all duration-500 ${done ? connectorBg(true, hue) : 'bg-transparent'}`}
                style={done ? {} : DASH_H_STYLE}
            />
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════════ */
export default function OrderTracker({ status, createdAt, updatedAt, isRefunded }: Props) {

    /* ── CANCELLED ─── */
    if (status === 'cancelled') {
        return (
            <div className="w-full">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Order Timeline</p>

                {/* Mobile */}
                <div className="flex flex-col md:hidden">
                    <VStep Icon={Package} label="Order Placed" state="done" date={fmt(createdAt)} hue="green" isLast={false} connectorDone />
                    <VStep Icon={X} label="Cancelled" state="active" date={updatedAt ? fmt(updatedAt) : undefined} hue="red" isLast connectorDone={false} />
                </div>

                {/* Desktop */}
                <div className="hidden md:flex items-start">
                    <HStep Icon={Package} label="Order Placed" state="done" date={fmt(createdAt)} hue="green" />
                    <HConnector done hue="red" />
                    <HStep Icon={X} label="Cancelled" state="active" date={updatedAt ? fmt(updatedAt) : undefined} hue="red" />
                </div>
            </div>
        );
    }

    /* ── RETURN FLOW (Requested, Received, or Refunded) ─── */
    if (status === 'return_requested' || status === 'returned') {
        const isReturned = status === 'returned';
        const isFullyRefunded = !!isRefunded;
        
        return (
            <div className="w-full">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Order Timeline</p>

                {/* Mobile vertical */}
                <div className="flex flex-col md:hidden">
                    {STEPS.map((step, i) => (
                        <VStep key={step.key} Icon={step.Icon} label={step.label} state="done"
                            date={i === 0 ? fmt(createdAt) : undefined} hue="green"
                            isLast={false} connectorDone />
                    ))}
                    <VStep Icon={Package} label="Return Req." state={isReturned ? 'done' : 'active'} date={!isReturned && updatedAt ? fmt(updatedAt) : undefined} hue="orange" isLast={false} connectorDone={isReturned} />
                    <VStep Icon={RotateCcw} label="Returned" state={isFullyRefunded ? 'done' : (isReturned ? 'active' : 'future')} date={isReturned && !isFullyRefunded && updatedAt ? fmt(updatedAt) : undefined} hue="orange" isLast={false} connectorDone={isFullyRefunded} />
                    <VStep Icon={Check} label="Refunded" state={isFullyRefunded ? 'active' : 'future'} date={isFullyRefunded && updatedAt ? fmt(updatedAt) : undefined} hue="orange" isLast connectorDone={false} />
                </div>

                {/* Desktop horizontal */}
                <div className="hidden md:flex items-start">
                    {STEPS.map((step, i) => (
                        <div key={step.key} className="flex items-start flex-1">
                            <HStep Icon={step.Icon} label={step.label} state="done" date={i === 0 ? fmt(createdAt) : undefined} hue="green" />
                            <HConnector done hue={i === STEPS.length - 1 ? 'orange' : 'green'} />
                        </div>
                    ))}
                    <div className="flex items-start flex-1">
                        <HStep Icon={Package} label="Return Req." state={isReturned ? 'done' : 'active'} date={!isReturned && updatedAt ? fmt(updatedAt) : undefined} hue="orange" />
                        <HConnector done={isReturned} hue="orange" />
                    </div>
                    <div className="flex items-start flex-1">
                        <HStep Icon={RotateCcw} label="Returned" state={isFullyRefunded ? 'done' : (isReturned ? 'active' : 'future')} date={isReturned && !isFullyRefunded && updatedAt ? fmt(updatedAt) : undefined} hue="orange" />
                        <HConnector done={isFullyRefunded} hue="orange" />
                    </div>
                    <div className="flex items-start">
                        <HStep Icon={Check} label="Refunded" state={isFullyRefunded ? 'active' : 'future'} date={isFullyRefunded && updatedAt ? fmt(updatedAt) : undefined} hue="orange" />
                    </div>
                </div>
            </div>
        );
    }

    /* ── STANDARD happy-path ─── */
    const currentIdx = STATUS_ORDER.indexOf(status);

    return (
        <div className="w-full">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Order Timeline</p>

            {/* Mobile vertical */}
            <div className="flex flex-col md:hidden">
                {STEPS.map((step, i) => {
                    const stepIdx = STATUS_ORDER.indexOf(step.key);
                    const state: 'done' | 'active' | 'future' =
                        stepIdx < currentIdx ? 'done' : stepIdx === currentIdx ? 'active' : 'future';
                    const isLast = i === STEPS.length - 1;
                    const connectorDone = stepIdx < currentIdx - 1 ||
                        (stepIdx === currentIdx - 1); // line below a completed step is solid

                    let date: string | undefined;
                    if (i === 0) date = fmt(createdAt);
                    else if (state === 'active' && updatedAt) date = fmt(updatedAt);

                    return (
                        <VStep key={step.key} Icon={step.Icon} label={step.label}
                            state={state} date={date} hue="green"
                            isLast={isLast} connectorDone={stepIdx < currentIdx} />
                    );
                })}
            </div>

            {/* Desktop horizontal */}
            <div className="hidden md:flex items-start">
                {STEPS.map((step, i) => {
                    const stepIdx = STATUS_ORDER.indexOf(step.key);
                    const state: 'done' | 'active' | 'future' =
                        stepIdx < currentIdx ? 'done' : stepIdx === currentIdx ? 'active' : 'future';
                    const isLast = i === STEPS.length - 1;

                    let date: string | undefined;
                    if (i === 0) date = fmt(createdAt);
                    else if (state === 'active' && updatedAt) date = fmt(updatedAt);

                    return (
                        <div key={step.key} className={`flex items-start ${isLast ? '' : 'flex-1'}`}>
                            <HStep Icon={step.Icon} label={step.label} state={state} date={date} hue="green" />
                            {!isLast && <HConnector done={stepIdx < currentIdx} hue="green" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
