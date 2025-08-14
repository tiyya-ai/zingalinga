'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues
const ZingaLingaApp = dynamic(() => import('../components/ZingaLingaApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Zinga Linga...</h2>
        <p className="text-gray-600">Please wait while we prepare your experience</p>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Zinga Linga...</h2>
          <p className="text-gray-600">Please wait while we prepare your experience</p>
        </div>
      </div>
    }>
      <ZingaLingaApp />
    </Suspense>
  );
}