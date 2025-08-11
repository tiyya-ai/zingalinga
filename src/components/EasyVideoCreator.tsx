'use client';

import React, { useState } from 'react';
import { Button, Input, Textarea, Select, SelectItem, Card, CardBody, Progress } from '@nextui-org/react';
import { Upload, Video, CheckCircle, DollarSign, Tag } from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';

interface EasyVideoCreatorProps {
  onSuccess: () => void;
  categories: string[];
}

export default function EasyVideoCreator({ onSuccess, categories }: EasyVideoCreatorProps) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    price: 9.99,
    category: categories[0] || 'education',
    videoUrl: '',
    thumbnail: '',
    duration: '',
    tags: ''
  });

  const handleVideoUpload = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      alert('File must be under 50MB');
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Auto-generate title from filename
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setVideoData(prev => ({ ...prev, title }));
      setProgress(30);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const videoUrl = e.target?.result as string;
        setProgress(60);

        // Get video metadata
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const duration = video.duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

          // Generate thumbnail
          video.currentTime = duration / 3;
          video.oncanplay = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, 320, 180);
              const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
              
              setVideoData(prev => ({
                ...prev,
                videoUrl,
                thumbnail,
                duration: formattedDuration
              }));
              
              setProgress(100);
              setIsProcessing(false);
              setStep(2);
            }
          };
        };
        video.src = videoUrl;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsProcessing(false);
      alert('Upload failed. Try again.');
    }
  };

  const handleSave = async () => {
    if (!videoData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsProcessing(true);
    
    try {
      const newVideo = {
        id: `video_${Date.now()}`,
        title: videoData.title,
        description: videoData.description,
        price: videoData.price,
        category: videoData.category,
        videoUrl: videoData.videoUrl,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
        estimatedDuration: videoData.duration,
        tags: videoData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isActive: true,
        rating: 0,
        createdAt: new Date().toISOString()
      };

      const success = await vpsDataStore.addProduct(newVideo);
      
      if (success) {
        alert('✅ Video added successfully!');
        onSuccess();
        // Reset form
        setVideoData({
          title: '',
          description: '',
          price: 9.99,
          category: categories[0] || 'education',
          videoUrl: '',
          thumbnail: '',
          duration: '',
          tags: ''
        });
        setStep(1);
      } else {
        alert('❌ Failed to save video');
      }
    } catch (error) {
      alert('❌ Error saving video');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardBody className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Easy Video Creator</h2>
          <p className="text-gray-600">Add videos in 2 simple steps</p>
        </div>

        {/* Step 1: Upload Video */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <h3 className="text-lg font-semibold">Upload Your Video</h3>
            </div>

            {isProcessing ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                  <p className="font-medium text-blue-600">Processing video...</p>
                  <Progress value={progress} className="w-full mt-2" color="primary" />
                  <p className="text-sm text-gray-500 mt-1">{progress}% complete</p>
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('video-input')?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('video/')) {
                    handleVideoUpload(file);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop video here or click to browse
                </h4>
                <p className="text-gray-600 mb-4">MP4, MOV, AVI - Max 50MB</p>
                <Button color="primary" size="lg">
                  Choose Video File
                </Button>
                <input
                  id="video-input"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file);
                  }}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Add Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <h3 className="text-lg font-semibold">Add Video Details</h3>
            </div>

            {/* Video Preview */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video src={videoData.videoUrl} controls className="w-full h-full object-cover" />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Video Title"
                  value={videoData.title}
                  onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter video title"
                  isRequired
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  value={videoData.description}
                  onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your video"
                  rows={3}
                />
              </div>

              <Input
                label="Price"
                type="number"
                value={videoData.price.toString()}
                onChange={(e) => setVideoData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                startContent={<DollarSign className="h-4 w-4" />}
              />

              <Select
                label="Category"
                selectedKeys={[videoData.category]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setVideoData(prev => ({ ...prev, category: selected }));
                }}
              >
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </Select>

              <div className="md:col-span-2">
                <Input
                  label="Tags"
                  value={videoData.tags}
                  onChange={(e) => setVideoData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="education, kids, fun (comma separated)"
                  startContent={<Tag className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="flat"
                onPress={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                color="success"
                onPress={handleSave}
                isLoading={isProcessing}
                startContent={<CheckCircle className="h-4 w-4" />}
                className="flex-1"
              >
                {isProcessing ? 'Saving...' : 'Save Video'}
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}