'use client';
import { motion } from 'motion/react';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            // initial={{
            //   y: 20,
            //   opacity: 0,
            // }}
            // animate={{
            //   y: 0,
            //   opacity: 1,
            // }}
            transition={{ ease: 'easeInOut', duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
}
