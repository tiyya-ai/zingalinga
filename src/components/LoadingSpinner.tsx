'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = '', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  // Return empty div - no loading screens
  return <div></div>;
}