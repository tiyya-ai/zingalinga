'use client';

import React, { useState, useRef } from 'react';
import { Button, Input, Progress } from '@nextui-org/react';
import { Upload, Video, CheckCircle, X } from 'lucide-react';

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
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const videoUrl = e.target?.result as string;
        setVideoPreview(videoUrl);
        
        // Get video duration
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const duration = video.duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          clearInterval(progressInterval);
          setProgress(100);
          setIsUploading(false);
          
          // Auto-generate thumbnail
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

  const reset = () => {
    setVideoPreview(null);
    setTitle('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Quick Video Upload</h3>
      
      {!videoPreview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm font-medium text-blue-600">Uploading video...</p>
                <Progress value={progress} className="w-full mt-2" color="primary" />
                <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drag & drop your video here
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">MP4, MOV, AVI - Max 100MB</p>
              </div>
              <Button 
                color="primary" 
                onPress={() => fileInputRef.current?.click()}
              >
                Choose Video File
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
              startContent={<CheckCircle className="h-4 w-4" />}
              onPress={() => {
                if (title.trim()) {
                  // Video data is already passed via onVideoUploaded
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
              onPress={reset}
              startContent={<X className="h-4 w-4" />}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}