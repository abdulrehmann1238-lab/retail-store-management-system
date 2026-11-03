'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

const MESSAGES = [
  'Preparing inventory...',
  'Loading products & barcodes...',
  'Organizing your workspace...',
  'Almost ready...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  minDurationMs = 1200,
}) => {
  const [progress, setProgress] = useState(15);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const stepTime = minDurationMs / 4;
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 25;
      });
    }, stepTime);

    const messageTimer = setInterval(() => {
      setMessageIndex(prev => {
        if (prev < MESSAGES.length - 1) return prev + 1;
        return prev;
      });
    }, stepTime);

    const completeTimer = setTimeout(() => {
      setIsDone(true);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, minDurationMs + 100);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
      clearTimeout(completeTimer);
    };
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-app-bg px-6 select-none"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center max-w-sm w-full"
          >
            <Logo className="scale-125 mb-8" />

            <h2 className="text-sm font-medium tracking-tight text-content-primary mb-1">
              Preparing your workspace
            </h2>

            <p className="text-xs text-content-secondary min-h-[1.5rem] transition-all">
              {MESSAGES[messageIndex]}
            </p>

            {/* Refined thin forest green progress bar */}
            <div className="w-48 h-1 bg-app-border rounded-full overflow-hidden mt-6 mb-3">
              <motion.div
                className="h-full bg-brand rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeInOut', duration: 0.3 }}
              />
            </div>

            <span className="text-[10px] font-mono text-content-muted tracking-widest uppercase">
              Multan Retail Flagship • STOCKROOM v2.4
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

