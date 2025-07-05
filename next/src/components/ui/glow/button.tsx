import { GlowEffect } from '@/components/motion-primitives/glow-effect';
import { ArrowRight } from 'lucide-react';

export function Button({
    children,
    ...props
}: { children?: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <div className="relative">
            <GlowEffect
                colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']}
                mode="colorShift"
                blur="soft"
                duration={3}
                scale={1.1}
            />
            <button className="relative inline-flex items-center gap-1 rounded-md bg-primary/70 text-primary-content px-4 py-2 text-sm  outline outline-xs outline-[#fff2f21f]">
                {children}
            </button>
        </div>
    );
}
