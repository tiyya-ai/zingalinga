'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from '@nextui-org/react';
import { Link } from 'lucide-react';

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
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [urlThumbnail, setUrlThumbnail] = useState<string | null>(initialData?.thumbnail || null);
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

  const fetchYouTubeVideoInfo = async (videoId: string) => {
    try {
      // Try to get video info from YouTube oEmbed API
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title || 'YouTube Video',
          duration: 'YouTube Video' // YouTube API requires API key for duration
        };
      }
    } catch (error) {
      console.log('Could not fetch YouTube video info:', error);
    }
    return { title: 'YouTube Video', duration: 'YouTube Video' };
  };

  const handleUrlChange = async (url: string) => {
    setVideoUrl(url);
    if (url.trim()) {
      const youtubeId = getYouTubeVideoId(url);
      const vimeoId = getVimeoVideoId(url);
      
      if (youtubeId) {
        setUrlPreview(`https://www.youtube.com/embed/${youtubeId}`);
        setUrlThumbnail(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
        
        // Try to get video info
        const videoInfo = await fetchYouTubeVideoInfo(youtubeId);
        
        // Auto-populate video data for YouTube
        onVideoUploaded({
          title: title || videoInfo.title,
          videoUrl: url,
          duration: videoInfo.duration,
          thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        });
      } else if (vimeoId) {
        setUrlPreview(`https://player.vimeo.com/video/${vimeoId}`);
        setUrlThumbnail(`https://vumbnail.com/${vimeoId}.jpg`);
        // Auto-populate video data for Vimeo
        onVideoUploaded({
          title: title || 'Vimeo Video',
          videoUrl: url,
          duration: '5:00',
          thumbnail: `https://vumbnail.com/${vimeoId}.jpg`
        });
      } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        setUrlPreview(url);
        // For direct video files, try to get duration from video element
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          const duration = video.duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          onVideoUploaded({
            title: title || 'Video',
            videoUrl: url,
            duration: formattedDuration
          });
        };
        video.onerror = () => {
          onVideoUploaded({
            title: title || 'Video',
            videoUrl: url,
            duration: 'Unknown'
          });
        };
        video.src = url;
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

  const handleUrlSubmit = async () => {
    if (!videoUrl.trim()) return;
    
    let videoTitle = title.trim();
    let videoDuration = 'Unknown';
    
    const youtubeId = getYouTubeVideoId(videoUrl);
    const vimeoId = getVimeoVideoId(videoUrl);
    
    if (youtubeId) {
      const videoInfo = await fetchYouTubeVideoInfo(youtubeId);
      videoTitle = videoTitle || videoInfo.title;
      videoDuration = videoInfo.duration;
    } else if (vimeoId) {
      videoTitle = videoTitle || 'Vimeo Video';
      videoDuration = '5:00';
    } else if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      videoTitle = videoTitle || 'Video';
      // Try to get duration from video element
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        videoDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };
      video.src = videoUrl;
    } else {
      videoTitle = videoTitle || 'Video';
    }
    
    onVideoUploaded({
      title: videoTitle,
      videoUrl: videoUrl,
      duration: videoDuration,
      thumbnail: urlThumbnail || undefined
    });
    
    // Clear form after successful submission
    setVideoUrl('');
    setTitle('');
    setUrlPreview(null);
    setUrlThumbnail(null);
  };

  const reset = () => {
    setVideoUrl('');
    setUrlPreview(null);
    setUrlThumbnail(null);
    setTitle('');
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-6">Add New Video</h3>
      
      <div className="space-y-4">
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
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">Supports YouTube, Vimeo, and direct video links</p>
        </div>
      </div>
    </div>
  );
}