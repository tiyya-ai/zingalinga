'use client';

import React, { useState, useRef } from 'react';
import { Button, Input, Progress } from '@nextui-org/react';
import { Upload, Video, CheckCircle, X, Link } from 'lucide-react';

interface SimpleVideoUploaderProps {
  onVideoUploaded: (videoData: {
    title: string;
    videoUrl: string;
    duration: string;
    thumbnail?: string;
  }) => void;
}

export default function SimpleVideoUploader({ onVideoUploaded }: SimpleVideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setTitle(file.name.replace(/\.[^/.]+$/, ''));

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const reader = new FileReader();
      reader.onload = (e) => {
        const videoUrl = e.target?.result as string;
        setVideoPreview(videoUrl);
        
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const duration = video.duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          clearInterval(progressInterval);
          setProgress(100);
          setIsUploading(false);
          
          video.currentTime = duration / 2;
          video.oncanplay = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
            
            onVideoUploaded({
              title,
              videoUrl,
              duration: formattedDuration,
              thumbnail
            });
          };
        };
        video.src = videoUrl;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      alert('Upload failed. Please try again.');
    }
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
      duration: 'Unknown'
    });
    
    // Don't clear title, only clear URL
    setVideoUrl('');
  };

  const reset = () => {
    setVideoPreview(null);
    setVideoUrl('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-6">Quick Video Upload</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video URL Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Add Video URL</h4>
          <Input
            label="Video URL"
            placeholder="Paste video link here"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            startContent={<Link className="h-4 w-4 text-gray-400" />}
            classNames={{
              input: "bg-white",
              inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
            }}
          />
          <Input
            label="Video Title"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-xs text-gray-500">Supports YouTube, Vimeo, and direct video links</p>
          <Button 
            color="primary" 
            className="w-full"
            onPress={handleUrlSubmit}
            isDisabled={!videoUrl.trim()}
            startContent={<Video className="h-4 w-4" />}
          >
            Add Video URL
          </Button>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Upload Video File</h4>
          {!videoPreview ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Uploading...</p>
                    <Progress value={progress} className="w-full mt-2" color="primary" />
                    <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Drop video here</p>
                    <p className="text-xs text-gray-500">MP4, MOV, AVI - Max 100MB</p>
                  </div>
                  <Button 
                    size="sm"
                    color="primary" 
                    onPress={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video src={videoPreview} controls className="w-full h-full object-cover" />
              </div>
              
              <Input
                label="Video Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
              />
              
              <div className="flex gap-2">
                <Button 
                  color="success" 
                  className="flex-1"
                  size="sm"
                  startContent={<CheckCircle className="h-4 w-4" />}
                  onPress={() => {
                    if (title.trim()) {
                      reset();
                    } else {
                      alert('Please enter a video title');
                    }
                  }}
                >
                  Add Video
                </Button>
                <Button 
                  variant="flat" 
                  size="sm"
                  onPress={reset}
                  startContent={<X className="h-4 w-4" />}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}