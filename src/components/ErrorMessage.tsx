'use client';

import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ 
  title = 'حدث خطأ', 
  message, 
  onRetry, 
  type = 'error' 
}: ErrorMessageProps) {
  const typeStyles = {
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      icon: '❌',
      iconBg: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      icon: '⚠️',
      iconBg: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      icon: 'ℹ️',
      iconBg: 'bg-blue-500'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`${styles.bg} backdrop-blur-sm rounded-xl p-6 border ${styles.border} text-center`}>
      <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <span className="text-2xl">{styles.icon}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-purple-200 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold px-6 py-3 rounded-lg transition-all duration-200"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}