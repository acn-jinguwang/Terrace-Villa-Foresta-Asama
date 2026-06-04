'use client';
import { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface Props {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function FadeUp({ children, delay = 0, className = '' }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const delayCls = delay > 0 ? `foresta-delay-${delay}` : '';
  return (
    <div
      ref={ref}
      className={`foresta-fade-up ${delayCls} ${inView ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
