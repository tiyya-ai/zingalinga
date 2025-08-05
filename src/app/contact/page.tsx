'use client';

import ContactPage from '../../page-components/ContactPage';
import { useRouter } from 'next/navigation';

export default function Contact() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
  };

  const handleNavigate = (page: string) => {
    if (typeof window !== 'undefined') {
      router.push(page === 'home' ? '/' : `/${page}`);
    }
  };

  return <ContactPage onBack={handleBack} onNavigate={handleNavigate} />;
}