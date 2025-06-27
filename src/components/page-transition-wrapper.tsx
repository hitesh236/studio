'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export const PageTransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initialState"
        animate="animateState"
        exit="exitState"
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        variants={{
          initialState: {
            opacity: 0,
            y: 10,
          },
          animateState: {
            opacity: 1,
            y: 0,
          },
          exitState: {
            opacity: 0,
            y: -10,
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
