'use client';

import { useLenis } from '@/hooks/useLenis';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useLenis();
  return <>{children}</>;
}
