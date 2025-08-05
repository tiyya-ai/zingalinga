'use client';

import TermsPage from '../../page-components/TermsPage';

export default function Terms() {
  const handleBack = () => {
    window.location.href = '/';
  };

  const handleNavigate = (page: string) => {
    window.location.href = page === 'home' ? '/' : `/${page}`;
  };

  return <TermsPage onBack={handleBack} onNavigate={handleNavigate} />;
}