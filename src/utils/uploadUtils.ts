import { vpsDataStore } from './vpsDataStore';

export interface UploadFormData {
  title: string;
  description: string;
  videoFile: File | null;
  category: string;
}

export interface UploadItem {
  id: string;
  fileName: string;
  title: string;
  size: string;
  status: 'uploading' | 'processing' | 'encoding' | 'completed' | 'failed';
  progress: number;
  uploadedAt: string;
  duration?: string;
  errorMessage?: string;
}

export const processRealUpload = async (
  uploadId: string, 
  formData: UploadFormData,
  setUploadQueue: (updateFn: (prev: UploadItem[]) => UploadItem[]) => void,
  loadVideos: () => Promise<void>
) => {
  try {
    // Update status to processing in both local state and data store
    await vpsDataStore.updateUploadQueueItem(uploadId, { status: 'processing', progress: 25 });
    setUploadQueue(prev => prev.map(item => 
      item.id === uploadId 
        ? { ...item, status: 'processing' as const, progress: 25 }
        : item
    ));

    // Create video URL from file
    let videoUrl = '';
    let thumbnailUrl = '';
    if (formData.videoFile) {
      // In a real app, you would upload to a cloud service like AWS S3, Cloudinary, etc.
      // For now, we'll create a local object URL
      videoUrl = URL.createObjectURL(formData.videoFile);
      
      // Generate a simple thumbnail (in real app, you'd extract from video)
      thumbnailUrl = '/placeholder-video.jpg';
    }

    // Update progress to encoding
    await vpsDataStore.updateUploadQueueItem(uploadId, { status: 'encoding', progress: 50 });
    setUploadQueue(prev => prev.map(item => 
      item.id === uploadId 
        ? { ...item, status: 'encoding' as const, progress: 50 }
        : item
    ));

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create the video product data
    const videoData = {
      id: uploadId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      videoUrl: videoUrl,
      thumbnail: thumbnailUrl,
      features: [],
      rating: 0,
      totalRatings: 0,
      fullContent: [],
      isActive: true,
      isVisible: true,
      difficulty: 'beginner',
      estimatedDuration: '15 minutes',
      tags: [formData.category],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update progress to finalizing
    await vpsDataStore.updateUploadQueueItem(uploadId, { status: 'processing', progress: 75 });
    setUploadQueue(prev => prev.map(item => 
      item.id === uploadId 
        ? { ...item, status: 'processing' as const, progress: 75 }
        : item
    ));

    // Add to real data store
    await vpsDataStore.addProduct(videoData);

    // Update progress to completed
    await vpsDataStore.updateUploadQueueItem(uploadId, { status: 'completed', progress: 100 });
    setUploadQueue(prev => prev.map(item => 
      item.id === uploadId 
        ? { ...item, status: 'completed' as const, progress: 100 }
        : item
    ));

    // Reload videos to show the new one
    await loadVideos();

    console.log('Video uploaded successfully:', videoData);
  } catch (error) {
    console.error('Upload failed:', error);
    const errorMessage = 'Upload failed: ' + (error as Error).message;
    
    // Update error status in both local state and data store
    await vpsDataStore.updateUploadQueueItem(uploadId, { 
      status: 'failed', 
      progress: 0, 
      errorMessage 
    });
    setUploadQueue(prev => prev.map(item => 
      item.id === uploadId 
        ? { ...item, status: 'failed' as const, progress: 0, errorMessage }
        : item
    ));
  }
};