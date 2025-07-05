'use client';
import { useRef } from 'react';
import { ScrollProgress } from '@/components/ui/scroll-progress';

export function ScrollProgressBasic({ children }: { children?: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="h-full overflow-auto px-8 pb-16 pt-16" ref={containerRef}>
            <div className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-white to-transparent backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] dark:bg-neutral-950" />
            <div className="pointer-events-none absolute left-0 top-0 w-full">
                <div className="absolute left-0 top-0 h-0.5 w-full dark:bg-[#111111]" />
                <ScrollProgress
                    className="absolute top-0 h-1 bg-[linear-gradient(to_right,rgba(0,0,0,0),#111111_75%,#111111_100%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0),#ffffff_75%,#ffffff_100%)]"
                    containerRef={containerRef}
                    springOptions={{
                        stiffness: 280,
                        damping: 18,
                        mass: 0.3
                    }}
                />
            </div>
            {children}
        </div>
    );
}
