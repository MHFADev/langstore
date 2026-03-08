
'use client';

import { motion, useInView, UseInViewOptions } from 'framer-motion';
import { useRef } from 'react';

interface FramerWrapperProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  x?: number;
  duration?: number;
  delay?: number;
  scale?: number;
  opacity?: number;
  once?: boolean;
}

export const FramerWrapper = ({
  children,
  className,
  y = 50,
  x = 0,
  duration = 0.5,
  delay = 0,
  scale = 1,
  opacity = 0,
  once = true,
}: FramerWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: opacity, y: y, x: x, scale: scale === 1 ? 0.95 : scale }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : {}}
      transition={{ duration: duration, delay: delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className, layout }: { children: React.ReactNode; className?: string; layout?: boolean }) => {
  return (
    <motion.div
      layout={layout}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
