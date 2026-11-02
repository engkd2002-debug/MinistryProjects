import type { HTMLAttributes } from 'react';
import './motion.css';
export const motionTokens = {
  feedback: 140,
  dialog: 180,
  disclosure: 220,
  panel: 260,
  theme: 200,
  map: 380,
  chart: 450,
} as const;
export function MotionRegion({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`motion-region ${className}`} {...props} />;
}
