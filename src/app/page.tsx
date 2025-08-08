'use client';

import { PageRouter } from '../components/PageRouter';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function RootPage() {
  return (
    <ErrorBoundary>
      <PageRouter />
    </ErrorBoundary>
  );
}