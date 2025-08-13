import React, { useState, useEffect } from 'react';
import { AudioLessonsManager } from './AudioLessonsManager';
import { PP1ProgramManager } from './PP1ProgramManager';
import { vpsDataStore } from '../utils/vpsDataStore';

// Integration component to show how to use the new managers in ModernAdminDashboard
export const ContentManagementIntegration = () => {
  const [audioLessons, setAudioLessons] = useState([]);
  const [pp1Modules, setPP1Modules] = useState([]);

  // Load data on component mount
  useEffect(() => {
    loadAudioLessons();
    loadPP1Modules();
  }, []);

  const loadAudioLessons = async () => {
    try {
      const products = await vpsDataStore.getProducts();
      const lessons = products.filter(p => p.category === 'Audio Lessons' || p.type === 'audio');
      setAudioLessons(lessons);
    } catch (error) {
      console.error('Failed to load audio lessons:', error);
    }
  };

  const loadPP1Modules = async () => {
    try {
      const products = await vpsDataStore.getProducts();
      const pp1Content = products.filter(p => p.category === 'PP1 Program');
      
      // Group content into modules (this is a simplified example)
      const modules = [{
        id: 'module_1',
        title: 'Introduction to Learning',
        description: 'Basic concepts and fundamentals for beginners',
        lessons: pp1Content.map(content => ({
          id: content.id,
          title: content.title,
          description: content.description,
          contentType: 'video',
          contentUrl: content.videoUrl,
          duration: content.duration || '15 min',
          difficulty: 'beginner',
          order: 1,
          isLocked: false,
          prerequisites: [],
          objectives: ['Understand basic concepts', 'Complete first lesson'],
          materials: ['Notebook', 'Pen'],
          completed: false,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt
        })),
        order: 1,
        estimatedDuration: '2 hours',
        completionRate: 0,
        isActive: true
      }];
      
      setPP1Modules(modules);
    } catch (error) {
      console.error('Failed to load PP1 modules:', error);
    }
  };

  // Audio Lessons handlers
  const handleAddAudioLesson = async (lessonData) => {
    try {
      const newLesson = {
        id: `audio_${Date.now()}`,
        ...lessonData,
        category: 'Audio Lessons',
        type: 'audio',
        isActive: true,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const success = await vpsDataStore.addProduct(newLesson);
      if (success) {
        await loadAudioLessons();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add audio lesson:', error);
      return false;
    }
  };

  const handleUpdateAudioLesson = async (id, lessonData) => {
    try {
      const success = await vpsDataStore.updateProduct({
        id,
        ...lessonData,
        updatedAt: new Date().toISOString()
      });
      if (success) {
        await loadAudioLessons();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update audio lesson:', error);
      return false;
    }
  };

  const handleDeleteAudioLesson = async (id) => {
    try {
      const success = await vpsDataStore.deleteProduct(id);
      if (success) {
        await loadAudioLessons();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete audio lesson:', error);
      return false;
    }
  };

  // PP1 Program handlers
  const handleAddPP1Module = async (moduleData) => {
    try {
      // In a real implementation, you'd store modules separately
      // For now, we'll create a placeholder product
      const newModule = {
        id: `pp1_module_${Date.now()}`,
        title: moduleData.title,
        description: moduleData.description,
        category: 'PP1 Program',
        type: 'module',
        price: 0,
        isActive: moduleData.isActive,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        moduleData: moduleData // Store module-specific data
      };

      const success = await vpsDataStore.addProduct(newModule);
      if (success) {
        await loadPP1Modules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add PP1 module:', error);
      return false;
    }
  };

  const handleUpdatePP1Module = async (id, moduleData) => {
    try {
      const success = await vpsDataStore.updateProduct({
        id,
        ...moduleData,
        updatedAt: new Date().toISOString()
      });
      if (success) {
        await loadPP1Modules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update PP1 module:', error);
      return false;
    }
  };

  const handleDeletePP1Module = async (id) => {
    try {
      const success = await vpsDataStore.deleteProduct(id);
      if (success) {
        await loadPP1Modules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete PP1 module:', error);
      return false;
    }
  };

  const handleAddPP1Lesson = async (moduleId, lessonData) => {
    try {
      const newLesson = {
        id: `pp1_lesson_${Date.now()}`,
        title: lessonData.title,
        description: lessonData.description,
        category: 'PP1 Program',
        type: 'lesson',
        videoUrl: lessonData.contentUrl,
        duration: lessonData.duration,
        price: 0,
        isActive: true,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        moduleId: moduleId,
        lessonData: lessonData
      };

      const success = await vpsDataStore.addProduct(newLesson);
      if (success) {
        await loadPP1Modules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add PP1 lesson:', error);
      return false;
    }
  };

  const handleUpdatePP1Lesson = async (moduleId, lessonId, lessonData) => {
    try {
      const success = await vpsDataStore.updateProduct({
        id: lessonId,
        ...lessonData,
        updatedAt: new Date().toISOString()
      });
      if (success) {
        await loadPP1Modules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update PP1 lesson:', error);
      return false;
    }
  };

  const handleDeletePP1Lesson = async (moduleId, lessonId) => {
    try {
      const success = await vpsDataStore.deleteProduct(lessonId);
      if (success) {
        await loadPP1Modules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete PP1 lesson:', error);
      return false;
    }
  };

  return {
    // Audio Lessons Component
    AudioLessonsComponent: () => (
      <AudioLessonsManager
        lessons={audioLessons}
        onAddLesson={handleAddAudioLesson}
        onUpdateLesson={handleUpdateAudioLesson}
        onDeleteLesson={handleDeleteAudioLesson}
      />
    ),

    // PP1 Program Component
    PP1ProgramComponent: () => (
      <PP1ProgramManager
        modules={pp1Modules}
        onAddModule={handleAddPP1Module}
        onUpdateModule={handleUpdatePP1Module}
        onDeleteModule={handleDeletePP1Module}
        onAddLesson={handleAddPP1Lesson}
        onUpdateLesson={handleUpdatePP1Lesson}
        onDeleteLesson={handleDeletePP1Lesson}
      />
    ),

    // Data refresh functions
    refreshAudioLessons: loadAudioLessons,
    refreshPP1Modules: loadPP1Modules
  };
};

// Instructions for integrating into ModernAdminDashboard.tsx:

/*
1. Import the integration at the top of ModernAdminDashboard.tsx:
   import { ContentManagementIntegration } from './ContentManagementIntegration';

2. Inside the component, initialize the integration:
   const contentManagement = ContentManagementIntegration();

3. Replace the existing renderAudioLessons function with:
   const renderAudioLessons = () => {
     return <contentManagement.AudioLessonsComponent />;
   };

4. Replace the existing renderPP1Program function with:
   const renderPP1Program = () => {
     return <contentManagement.PP1ProgramComponent />;
   };

5. Update the sidebar navigation to use these sections:
   - 'audio-lessons' should call renderAudioLessons()
   - 'pp1-program' should call renderPP1Program()

6. Optional: Add refresh buttons that call:
   - contentManagement.refreshAudioLessons()
   - contentManagement.refreshPP1Modules()
*/

export default ContentManagementIntegration;