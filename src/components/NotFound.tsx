'use client';

import React from 'react';

interface NotFoundProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
  showBackButton?: boolean;
}

export default function NotFound({ 
  title = 'الصفحة غير موجودة', 
  message = 'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.',
  onGoBack,
  showBackButton = true
}: NotFoundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 max-w-md w-full text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-purple-200 text-lg mb-8">{message}</p>
        
        {showBackButton && (
          <div className="space-y-4">
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold px-6 py-3 rounded-lg transition-all duration-200"
              >
                العودة للخلف
              </button>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200"
            >
              العودة للرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}