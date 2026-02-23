'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const BASE = 'shrink-0 px-4 py-3 min-h-[44px] md:py-2.5 flex items-center font-medium whitespace-nowrap touch-manipulation transition-colors';
const ACTIVE = 'text-[15px] text-blue-900 dark:text-blue-300 font-semibold';
const INACTIVE = 'text-sm text-muted-foreground hover:text-foreground';

interface NavItem {
    label: string;
    href: string;
}

function NavLinksInner({ items }: { items: NavItem[] }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isActive = (href: string) => {
        const [hrefPath, hrefQuery] = href.split('?');
        if (pathname !== hrefPath) return false;
        if (!hrefQuery) {
            // For plain "/products" — only active if NO relevant query params
            return !searchParams.get('sort') && !searchParams.get('bigSize') &&
                !searchParams.get('categoryId') && !searchParams.get('featured');
        }
        const hrefParams = new URLSearchParams(hrefQuery);
        return Array.from(hrefParams.entries()).every(
            ([key, val]) => searchParams.get(key) === val
        );
    };

    return (
        <>
            {items.map(({ label, href }) => (
                <Link
                    key={href}
                    href={href}
                    className={`${BASE} ${isActive(href) ? ACTIVE : INACTIVE}`}
                >
                    {label}
                </Link>
            ))}
        </>
    );
}

export default function NavLinks({ items }: { items: NavItem[] }) {
    return (
        <Suspense
            fallback={items.map(({ label, href }) => (
                <Link key={href} href={href} className={`${BASE} ${INACTIVE}`}>
                    {label}
                </Link>
            ))}
        >
            <NavLinksInner items={items} />
        </Suspense>
    );
}
