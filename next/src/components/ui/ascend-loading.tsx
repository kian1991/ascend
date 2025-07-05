import { motion } from 'motion/react';

export function AscendLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <motion.img
                src={'/img/a.png'}
                alt="Ascend Logo"
                className="w-64 mb-4"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: [0, 1, 0], y: [100, 0, -100] }}
                transition={{ ease: 'easeInOut', duration: 6, repeat: Infinity, repeatType: 'loop' }}
            />
        </div>
    );
}
