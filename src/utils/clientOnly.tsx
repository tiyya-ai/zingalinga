'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook to check if we're on the client side
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

// Generate stable IDs that won't cause hydration mismatches
let idCounter = 0;
export function generateStableId(prefix = 'id') {
  return `${prefix}-${++idCounter}`;
}

// Safe random number generator for client-side only
export function safeRandom() {
  if (typeof window === 'undefined') {
    return 0.5; // Return a stable value on server
  }
  return Math.random();
}

// Safe date generator for client-side only
export function safeNow() {
  if (typeof window === 'undefined') {
    return new Date('2024-01-01').getTime(); // Return a stable date on server
  }
  return Date.now();
}