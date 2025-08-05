'use client';

import PrivacyPage from '../../page-components/PrivacyPage';

export default function Privacy() {
  const handleBack = () => {
    window.location.href = '/';
  };

  const handleNavigate = (page: string) => {
    window.location.href = page === 'home' ? '/' : `/${page}`;
  };

  return <PrivacyPage onBack={handleBack} onNavigate={handleNavigate} />;
}