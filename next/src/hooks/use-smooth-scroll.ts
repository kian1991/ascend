import { useRef, useEffect, useCallback } from 'react';

interface UseSmoothScrollOptions {
    totalSteps: number;
    onStepChange?: (step: number) => void;
    disabled?: boolean;
}

export const useSmoothScroll = ({ totalSteps, onStepChange, disabled = false }: UseSmoothScrollOptions) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const currentStepRef = useRef(1);

    const scrollToStep = useCallback(
        (step: number, smooth = true) => {
            if (!containerRef.current || disabled) return;

            const container = containerRef.current;
            const stepHeight = container.scrollHeight / totalSteps;
            const targetScroll = (step - 1) * stepHeight;

            isScrollingRef.current = true;

            container.scrollTo({
                top: targetScroll,
                behavior: smooth ? 'smooth' : 'auto'
            });

            // Reset scrolling flag after animation
            setTimeout(
                () => {
                    isScrollingRef.current = false;
                },
                smooth ? 800 : 0
            );
        },
        [totalSteps, disabled]
    );

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (disabled || isScrollingRef.current) {
                e.preventDefault();
                return;
            }

            const delta = e.deltaY;
            const threshold = 50;

            if (Math.abs(delta) > threshold) {
                e.preventDefault();

                if (delta > 0 && currentStepRef.current < totalSteps) {
                    // Scroll down
                    const nextStep = currentStepRef.current + 1;
                    currentStepRef.current = nextStep;
                    scrollToStep(nextStep);
                    onStepChange?.(nextStep);
                } else if (delta < 0 && currentStepRef.current > 1) {
                    // Scroll up
                    const prevStep = currentStepRef.current - 1;
                    currentStepRef.current = prevStep;
                    scrollToStep(prevStep);
                    onStepChange?.(prevStep);
                }
            }
        },
        [disabled, totalSteps, scrollToStep, onStepChange]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (disabled || isScrollingRef.current) return;

            switch (e.key) {
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    if (currentStepRef.current < totalSteps) {
                        const nextStep = currentStepRef.current + 1;
                        currentStepRef.current = nextStep;
                        scrollToStep(nextStep);
                        onStepChange?.(nextStep);
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentStepRef.current > 1) {
                        const prevStep = currentStepRef.current - 1;
                        currentStepRef.current = prevStep;
                        scrollToStep(prevStep);
                        onStepChange?.(prevStep);
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    currentStepRef.current = 1;
                    scrollToStep(1);
                    onStepChange?.(1);
                    break;
                case 'End':
                    e.preventDefault();
                    currentStepRef.current = totalSteps;
                    scrollToStep(totalSteps);
                    onStepChange?.(totalSteps);
                    break;
            }
        },
        [disabled, totalSteps, scrollToStep, onStepChange]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container || disabled) return;

        // Add event listeners
        container.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('wheel', handleWheel);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleWheel, handleKeyDown, disabled]);

    const goToStep = useCallback(
        (step: number) => {
            if (step >= 1 && step <= totalSteps && !disabled) {
                currentStepRef.current = step;
                scrollToStep(step);
                onStepChange?.(step);
            }
        },
        [totalSteps, scrollToStep, onStepChange, disabled]
    );

    const nextStep = useCallback(() => {
        if (currentStepRef.current < totalSteps && !disabled) {
            const next = currentStepRef.current + 1;
            goToStep(next);
        }
    }, [totalSteps, goToStep, disabled]);

    const prevStep = useCallback(() => {
        if (currentStepRef.current > 1 && !disabled) {
            const prev = currentStepRef.current - 1;
            goToStep(prev);
        }
    }, [goToStep, disabled]);

    return {
        containerRef,
        scrollToStep,
        goToStep,
        nextStep,
        prevStep,
        currentStep: currentStepRef.current
    };
};
