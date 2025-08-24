'use client';

import React from 'react';
import { ArrowLeft, Clock, User, FileText, ShoppingCart, Settings, Video, Headphones } from 'lucide-react';

interface RecentActivityPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const RecentActivityPage: React.FC<RecentActivityPageProps> = ({ onBack, onNavigate }) => {
  // Mock data for recent activities - in a real app this would come from props or API
  const recentActivities = [
    {
      id: 1,
      type: 'user_login',
      description: 'User john.doe@example.com logged in',
      timestamp: '2024-01-15 14:30:25',
      icon: User,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'content_upload',
      description: 'New video "Math Basics" uploaded',
      timestamp: '2024-01-15 14:25:10',
      icon: Video,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'purchase',
      description: 'Package "Explorer Pack" purchased by user',
      timestamp: '2024-01-15 14:20:45',
      icon: ShoppingCart,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'audio_upload',
      description: 'Audio file "Pronunciation Guide" added',
      timestamp: '2024-01-15 14:15:30',
      icon: Headphones,
      color: 'text-orange-600'
    },
    {
      id: 5,
      type: 'settings_change',
      description: 'System settings updated',
      timestamp: '2024-01-15 14:10:15',
      icon: Settings,
      color: 'text-gray-600'
    },
    {
      id: 6,
      type: 'content_edit',
      description: 'Content "Science Basics" was modified',
      timestamp: '2024-01-15 14:05:00',
      icon: FileText,
      color: 'text-indigo-600'
    },
    {
      id: 7,
      type: 'user_registration',
      description: 'New user jane.smith@example.com registered',
      timestamp: '2024-01-15 13:55:20',
      icon: User,
      color: 'text-green-600'
    },
    {
      id: 8,
      type: 'purchase',
      description: 'Package "Adventurer Pack" purchased',
      timestamp: '2024-01-15 13:50:10',
      icon: ShoppingCart,
      color: 'text-purple-600'
    },
    {
      id: 9,
      type: 'content_upload',
      description: 'New audio "Language Basics" uploaded',
      timestamp: '2024-01-15 13:45:30',
      icon: Headphones,
      color: 'text-orange-600'
    },
    {
      id: 10,
      type: 'user_login',
      description: 'Admin user logged in',
      timestamp: '2024-01-15 13:40:15',
      icon: User,
      color: 'text-green-600'
    },
    {
      id: 11,
      type: 'content_edit',
      description: 'Video "Advanced Math" was updated',
      timestamp: '2024-01-15 13:35:45',
      icon: Video,
      color: 'text-blue-600'
    },
    {
      id: 12,
      type: 'settings_change',
      description: 'User permissions updated',
      timestamp: '2024-01-15 13:30:20',
      icon: Settings,
      color: 'text-gray-600'
    },
    {
      id: 13,
      type: 'purchase',
      description: 'Package "Roadtripper Pack" purchased',
      timestamp: '2024-01-15 13:25:10',
      icon: ShoppingCart,
      color: 'text-purple-600'
    },
    {
      id: 14,
      type: 'content_upload',
      description: 'New document "Study Guide" added',
      timestamp: '2024-01-15 13:20:30',
      icon: FileText,
      color: 'text-indigo-600'
    },
    {
      id: 15,
      type: 'user_login',
      description: 'User mike.wilson@example.com logged in',
      timestamp: '2024-01-15 13:15:45',
      icon: User,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Recent Activity</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              All recent system activities and user interactions
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <IconComponent className={`h-4 w-4 ${activity.color}`} />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


        </div>
      </div>
    </div>
  );
};

export default RecentActivityPage;