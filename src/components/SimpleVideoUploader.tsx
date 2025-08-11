'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Progress, Tabs, Tab } from '@nextui-org/react';
import { Upload, Video, CheckCircle, X, Link } from 'lucide-react';

interface SimpleVideoUploaderProps {
  onVideoUploaded: (videoData: {
    title: string;
    videoUrl: string;
    duration: string;
    thumbnail?: string;
  }) => void;
  initialData?: {
    title?: string;
    videoUrl?: string;
    thumbnail?: string;
    duration?: string;
  };
}

export default function SimpleVideoUploader({ onVideoUploaded, initialData }: SimpleVideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [urlThumbnail, setUrlThumbnail] = useState<string | null>(initialData?.thumbnail || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize preview when component mounts with initial data
  useEffect(() => {
    if (initialData?.videoUrl) {
      const youtubeId = getYouTubeVideoId(initialData.videoUrl);
      const vimeoId = getVimeoVideoId(initialData.videoUrl);
      
      if (youtubeId) {
        setUrlPreview(`https://www.youtube.com/embed/${youtubeId}`);
        if (!initialData.thumbnail) {
          setUrlThumbnail(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
        }
      } else if (vimeoId) {
        setUrlPreview(`https://player.vimeo.com/video/${vimeoId}`);
        if (!initialData.thumbnail) {
          setUrlThumbnail(`https://vumbnail.com/${vimeoId}.jpg`);
        }
      } else if (initialData.videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
        setUrlPreview(initialData.videoUrl);
      }
    }
  }, [initialData]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    alert('For large files, please use YouTube or other video hosting services to avoid storage issues.');
    return;
  };

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVimeoVideoId = (url: string) => {
    const regex = /vimeo\.com\/(?:.*#|\/)?([0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    if (url.trim()) {
      const youtubeId = getYouTubeVideoId(url);
      const vimeoId = getVimeoVideoId(url);
      
      if (youtubeId) {
        setUrlPreview(`https://www.youtube.com/embed/${youtubeId}`);
        setUrlThumbnail(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
        // Auto-populate video data for YouTube
        onVideoUploaded({
          title: title || 'YouTube Video',
          videoUrl: url,
          duration: 'Unknown',
          thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        });
      } else if (vimeoId) {
        setUrlPreview(`https://player.vimeo.com/video/${vimeoId}`);
        setUrlThumbnail(`https://vumbnail.com/${vimeoId}.jpg`);
        // Auto-populate video data for Vimeo
        onVideoUploaded({
          title: title || 'Vimeo Video',
          videoUrl: url,
          duration: 'Unknown',
          thumbnail: `https://vumbnail.com/${vimeoId}.jpg`
        });
      } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        setUrlPreview(url);
        onVideoUploaded({
          title: title || 'Video',
          videoUrl: url,
          duration: 'Unknown'
        });
      } else {
        setUrlPreview(null);
        setUrlThumbnail(null);
      }
    } else {
      setUrlPreview(null);
      setUrlThumbnail(null);
    }
  };

  const generateThumbnailFromUrl = (url: string) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.onloadedmetadata = () => {
      video.currentTime = video.duration / 2;
    };
    video.oncanplay = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      setUrlThumbnail(thumbnail);
    };
    video.onerror = () => {
      setUrlThumbnail(null);
    };
    video.src = url;
  };

  const handleUrlSubmit = () => {
    if (!videoUrl.trim()) return;
    
    let videoTitle = title.trim();
    if (!videoTitle) {
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        videoTitle = 'YouTube Video';
      } else if (videoUrl.includes('vimeo.com')) {
        videoTitle = 'Vimeo Video';
      } else {
        videoTitle = 'Video';
      }
    }
    
    onVideoUploaded({
      title: videoTitle,
      videoUrl: videoUrl,
      duration: 'Unknown',
      thumbnail: urlThumbnail || undefined
    });
    
    // Clear form after successful submission
    setVideoUrl('');
    setTitle('');
    setUrlPreview(null);
    setUrlThumbnail(null);
  };

  const reset = () => {
    setVideoPreview(null);
    setVideoUrl('');
    setUrlPreview(null);
    setUrlThumbnail(null);
    setProgress(0);
    setTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-6">Add New Video</h3>
      
      <Tabs aria-label="Video upload options" className="w-full">
        <Tab key="url" title="Video URL">
          <div className="space-y-4 pt-4">
            <Input
              placeholder="https://youtube.com/watch?v=example"
              value={videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              startContent={<Link className="h-4 w-4 text-gray-400" />}
            />
            {urlPreview && (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {urlPreview.includes('youtube.com/embed') || urlPreview.includes('player.vimeo.com') ? (
                    <iframe 
                      src={urlPreview}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      ref={videoRef}
                      src={urlPreview} 
                      controls 
                      className="w-full h-full object-cover"
                      onError={() => {
                        setUrlPreview(null);
                        setUrlThumbnail(null);
                      }}
                    />
                  )}
                </div>

              </div>
            )}
            <p className="text-xs text-gray-500">Supports YouTube, Vimeo, and direct video links</p>
          </div>
        </Tab>
        
        <Tab key="upload" title="Upload File">
          <div className="pt-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-yellow-50 border-yellow-300">
              <div className="space-y-3">
                <Upload className="h-8 w-8 text-yellow-500 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">File Upload Disabled</p>
                  <p className="text-xs text-yellow-600">Use YouTube, Vimeo, or direct video links instead</p>
                </div>
                <Button 
                  size="sm"
                  color="warning"
                  variant="flat"
                  isDisabled
                >
                  Upload Not Available
                </Button>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}