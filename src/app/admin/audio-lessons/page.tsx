'use client';

import React, { useState, useEffect } from 'react';
import { AudioLessonsManager } from '../../../components/AudioLessonsManager';
import { vpsDataStore } from '../../../utils/vpsDataStore';

interface AudioLesson {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  price: number;
  thumbnail?: string;
  tags: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  transcript?: string;
  hasPreview: boolean;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AudioLessonsPage() {
  const [lessons, setLessons] = useState<AudioLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const audioLessons = await vpsDataStore.getAudioLessons();
      setLessons(audioLessons);
    } catch (error) {
      console.error('Error loading audio lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (lesson: Omit<AudioLesson, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const success = await vpsDataStore.addAudioLesson(lesson);
      if (success) {
        await loadLessons();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding lesson:', error);
      return false;
    }
  };

  const handleUpdateLesson = async (id: string, lesson: Partial<AudioLesson>) => {
    try {
      const success = await vpsDataStore.updateAudioLesson(id, lesson);
      if (success) {
        await loadLessons();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating lesson:', error);
      return false;
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      const success = await vpsDataStore.deleteAudioLesson(id);
      if (success) {
        await loadLessons();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AudioLessonsManager
        lessons={lessons}
        onAddLesson={handleAddLesson}
        onUpdateLesson={handleUpdateLesson}
        onDeleteLesson={handleDeleteLesson}
      />
    </div>
  );
}