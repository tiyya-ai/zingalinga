'use client';

import React, { useState, useEffect } from 'react';
import { User, Purchase } from '../types';

interface AnalyticsData {
  totalWatchTime: number;
  videosWatched: number;
  favoriteCategory: string;
  weeklyProgress: number[];
  monthlySpending: number;
  achievements: Achievement[];
  learningStreak: number;
  completionRate: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  locked?: boolean;
}

interface UserAnalyticsProps {
  user: User;
  purchases: Purchase[];
  onClose: () => void;
}

export default function UserAnalytics({ user, purchases, onClose }: UserAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalWatchTime: 0,
    videosWatched: 0,
    favoriteCategory: 'Educational',
    weeklyProgress: [20, 35, 45, 30, 55, 40, 60],
    monthlySpending: 0,
    achievements: [],
    learningStreak: 0,
    completionRate: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadAnalyticsData();
  }, [purchases]);

  const loadAnalyticsData = () => {
    // Calculate analytics from real data
    const videosPurchased = purchases.filter(p => p.type === 'video').length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);
    const watchTime = videosPurchased * 15; // Estimate 15 minutes per video
    
    // Generate sample achievements
    const achievements: Achievement[] = [
      {
        id: '1',
        title: 'First Step',
        description: 'Watched your first video',
        icon: '🎬',
        unlockedAt: new Date(),
        rarity: 'common' as const
      },
      {
        id: '2',
        title: 'Active Learner',
        description: 'Watched 10 videos',
        icon: '📚',
        unlockedAt: new Date(),
        rarity: 'rare' as const
      },
      {
        id: '3',
        title: 'Knowledge Collector',
        description: 'Completed all videos in a category',
        icon: '🏆',
        unlockedAt: new Date(),
        rarity: 'epic' as const
      }
    ].filter((_, index) => index < Math.max(1, Math.floor(videosPurchased / 2)));

    setAnalyticsData({
      totalWatchTime: watchTime,
      videosWatched: videosPurchased,
      favoriteCategory: 'Educational',
      weeklyProgress: [20, 35, 45, 30, 55, 40, 60],
      monthlySpending: totalSpent,
      achievements,
      learningStreak: Math.min(videosPurchased, 7),
      completionRate: Math.min(100, (videosPurchased / 10) * 100)
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-purple-500/30">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-purple-500/30">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Learning Analytics</h2>
              <p className="text-purple-200">Track your progress and achievements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 p-6 border-b border-purple-500/30">
          {[
            { id: 'overview', label: '📈 Overview' },
            { id: 'progress', label: '📊 Progress' },
            { id: 'achievements', label: '🏆 Achievements' },
            { id: 'insights', label: '💡 Insights' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-yellow-400 text-purple-900'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Total Watch Time',
                    value: `${analyticsData.totalWatchTime} minutes`,
                    icon: '⏱️',
                    color: 'from-blue-500 to-purple-600',
                    change: '+15% this week'
                  },
                  {
                    title: 'Videos Watched',
                    value: analyticsData.videosWatched,
                    icon: '🎬',
                    color: 'from-green-500 to-blue-600',
                    change: '+3 this month'
                  },
                  {
                    title: 'Completion Rate',
                    value: `${analyticsData.completionRate.toFixed(0)}%`,
                    icon: '✅',
                    color: 'from-orange-500 to-red-600',
                    change: 'Excellent!'
                  },
                  {
                    title: 'Learning Streak',
                    value: `${analyticsData.learningStreak} days`,
                    icon: '🔥',
                    color: 'from-yellow-500 to-orange-600',
                    change: 'Keep going!'
                  }
                ].map((metric, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center text-2xl`}>
                        {metric.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        <div className="text-purple-200 text-sm">{metric.title}</div>
                      </div>
                    </div>
                    <div className="text-xs text-green-400 font-medium">{metric.change}</div>
                  </div>
                ))}
              </div>

              {/* Weekly Activity Chart */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Weekly Activity</h3>
                <div className="flex items-end justify-between h-40 space-x-2">
                  {analyticsData.weeklyProgress.map((value, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-gradient-to-t from-yellow-400 to-orange-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(value / 60) * 100}%` }}
                      ></div>
                      <div className="text-purple-200 text-xs mt-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analyticsData.achievements.slice(0, 3).map(achievement => (
                    <div key={achievement.id} className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-4 rounded-lg`}>
                      <div className="text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <div className="text-white font-bold text-sm">{achievement.title}</div>
                        <div className="text-white/80 text-xs">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Learning Path Progress */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Learning Path</h3>
                <div className="space-y-4">
                  {[
                    { category: 'Mathematics', progress: 75, total: 20, completed: 15 },
                    { category: 'Science', progress: 60, total: 15, completed: 9 },
                    { category: 'Language Arts', progress: 90, total: 12, completed: 11 },
                    { category: 'Arts', progress: 40, total: 10, completed: 4 }
                  ].map((path, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{path.category}</span>
                        <span className="text-purple-200 text-sm">{path.completed}/{path.total}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${path.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-purple-200 text-xs">{path.progress}% complete</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Goals */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Monthly Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { goal: 'Watch 20 videos', current: 12, target: 20, icon: '🎯' },
                    { goal: 'Spend 300 minutes learning', current: 180, target: 300, icon: '⏰' },
                    { goal: 'Complete 3 learning paths', current: 1, target: 3, icon: '🛤️' },
                    { goal: 'Earn 5 new achievements', current: 3, target: 5, icon: '🏆' }
                  ].map((goal, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <span className="text-white font-medium">{goal.goal}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-purple-200 text-sm">{goal.current} / {goal.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">All Achievements</h3>
                <div className="text-purple-200 text-sm">
                  {analyticsData.achievements.length} of 50 achievements
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  ...analyticsData.achievements,
                  // Add locked achievements
                  {
                    id: 'locked1',
                    title: 'Math Expert',
                    description: 'Complete all math videos',
                    icon: '🔒',
                    rarity: 'epic' as const,
                    locked: true
                  },
                  {
                    id: 'locked2',
                    title: 'Little Scientist',
                    description: 'Complete all science videos',
                    icon: '🔒',
                    rarity: 'legendary' as const,
                    locked: true
                  }
                ].map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className={`rounded-xl p-6 border transition-all duration-200 ${
                      achievement.locked
                        ? 'bg-white/5 border-white/20 opacity-60'
                        : `bg-gradient-to-br ${getRarityColor(achievement.rarity)}/20 border-white/30`
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-6xl mb-4 ${achievement.locked ? 'grayscale' : ''}`}>
                        {achievement.icon}
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{achievement.title}</h4>
                      <p className="text-purple-200 text-sm mb-4">{achievement.description}</p>
                      
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        achievement.rarity === 'common' ? 'bg-gray-600 text-white' :
                        achievement.rarity === 'rare' ? 'bg-blue-600 text-white' :
                        achievement.rarity === 'epic' ? 'bg-purple-600 text-white' :
                        'bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900'
                      }`}>
                        {achievement.rarity === 'common' ? 'Common' :
                         achievement.rarity === 'rare' ? 'Rare' :
                         achievement.rarity === 'epic' ? 'Epic' : 'Legendary'}
                      </div>
                      
                      {!achievement.locked && achievement.unlockedAt && (
                        <div className="text-green-400 text-xs mt-2">
                          Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Learning Insights */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Learning Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">📊</span>
                        <span className="text-white font-medium">Best Learning Time</span>
                      </div>
                      <p className="text-blue-200 text-sm">
                        Your data shows that your best learning times are between 4-6 PM
                      </p>
                    </div>
                    
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">🎯</span>
                        <span className="text-white font-medium">Favorite Category</span>
                      </div>
                      <p className="text-green-200 text-sm">
                        You spend most of your time watching {analyticsData.favoriteCategory} videos
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">🚀</span>
                        <span className="text-white font-medium">Recommendation</span>
                      </div>
                      <p className="text-purple-200 text-sm">
                        Try watching Arts videos to diversify your learning experience
                      </p>
                    </div>
                    
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">⚡</span>
                        <span className="text-white font-medium">Challenge</span>
                      </div>
                      <p className="text-orange-200 text-sm">
                        Try watching one video daily to maintain your learning streak
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison with Peers */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Comparison with Peers</h3>
                <div className="space-y-4">
                  {[
                    { metric: 'Weekly Watch Time', you: 120, average: 90, unit: 'minutes' },
                    { metric: 'Videos Completed', you: analyticsData.videosWatched, average: 8, unit: 'videos' },
                    { metric: 'Completion Rate', you: analyticsData.completionRate, average: 75, unit: '%' }
                  ].map((comparison, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{comparison.metric}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-yellow-400 font-bold">
                            You: {comparison.you} {comparison.unit}
                          </span>
                          <span className="text-purple-200">
                            Average: {comparison.average} {comparison.unit}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (comparison.you / Math.max(comparison.you, comparison.average)) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs mt-1">
                        {comparison.you > comparison.average ? (
                          <span className="text-green-400">Above average! 🎉</span>
                        ) : (
                          <span className="text-blue-400">Room for improvement 💪</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
