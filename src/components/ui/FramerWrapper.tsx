
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
  y = 20, // Reduced from 50
  x = 0,
  duration = 0.4, // Reduced from 0.5
  delay = 0,
  scale = 1,
  opacity = 0,
  once = true,
}: FramerWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: opacity, y: y, x: x, scale: scale === 1 ? 0.98 : scale }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : {}}
      transition={{ 
        duration: duration, 
        delay: delay, 
        ease: [0.25, 0.1, 0.25, 1], // Faster bezier
      }}
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
  staggerChildren = 0.05, // Faster stagger
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
      viewport={{ once: true, margin: "-20px" }}
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
        hidden: { opacity: 0, y: 10 }, // Reduced from 20
        show: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            type: "spring", 
            stiffness: 100, // Faster spring
            damping: 20,
            mass: 0.8
          } 
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
