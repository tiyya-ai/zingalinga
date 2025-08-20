'use client';

import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Progress,
} from '@nextui-org/react';
import {
  Upload,
  Video,
  X,
  RotateCcw
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';
import { sanitizeInput, validateId } from '../utils/securityUtils';

interface UploadItem {
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

interface UploadForm {
  title: string;
  description: string;
  videoFile: File | null;
  category: string;
  price: number;
}

interface UploadQueueComponentProps {
  uploadQueue: UploadItem[];
  setUploadQueue: React.Dispatch<React.SetStateAction<UploadItem[]>>;
  showUploadModal: boolean;
  setShowUploadModal: React.Dispatch<React.SetStateAction<boolean>>;
  uploadForm: UploadForm;
  setUploadForm: React.Dispatch<React.SetStateAction<UploadForm>>;
  loadVideos: () => Promise<void>;
}

export default function UploadQueueComponent({
  uploadQueue,
  setUploadQueue,
  showUploadModal,
  setShowUploadModal,
  uploadForm,
  setUploadForm,
  loadVideos
}: UploadQueueComponentProps) {

  const processRealUpload = async (uploadId: string, formData: UploadForm) => {
    try {
      // Update status to processing
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
        price: formData.price,
        originalPrice: formData.price,
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
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId 
          ? { ...item, status: 'processing' as const, progress: 75 }
          : item
      ));

      // Add to real data store
      await vpsDataStore.addProduct(videoData);

      // Update progress to completed
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
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId 
          ? { ...item, status: 'failed' as const, progress: 0, errorMessage: 'Upload failed: ' + (error as Error).message }
          : item
      ));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, videoFile: file });
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadForm.videoFile || !uploadForm.title) {
      alert('Please select a file and enter a title');
      return;
    }

    const newUpload = {
      id: Date.now().toString(),
      fileName: uploadForm.videoFile.name,
      title: uploadForm.title,
      size: `${Math.round(uploadForm.videoFile.size / (1024 * 1024))} MB`,
      status: 'uploading' as const,
      progress: 0,
      uploadedAt: new Date().toISOString(),
      duration: '0:00'
    };

    await vpsDataStore.addToUploadQueue(newUpload);
    setUploadQueue([newUpload, ...uploadQueue]);
    setShowUploadModal(false);

    // Start real upload process
    await processRealUpload(newUpload.id, uploadForm);

    // Reset form after upload starts
    setUploadForm({
      title: '',
      description: '',
      videoFile: null,
      category: 'educational',
      price: 0
    });
  };

  const handleRetryUpload = (uploadId: string) => {
    const sanitizedUploadId = sanitizeInput(uploadId);
    if (!validateId(sanitizedUploadId)) {
      console.error('Invalid upload ID provided');
      return;
    }
    const uploadItem = uploadQueue.find(item => item.id === sanitizedUploadId);
    if (uploadItem) {
      setUploadQueue(prev => prev.map(item => 
        item.id === sanitizedUploadId 
          ? { ...item, status: 'uploading' as const, progress: 0, errorMessage: undefined }
          : item
      ));
      // Retry with the original form data (you might want to store this)
      const retryFormData = {
        title: uploadItem.title,
        description: '',
        videoFile: null, // You'd need to store the original file
        category: 'educational',
        price: 0
      };
      processRealUpload(sanitizedUploadId, retryFormData);
    }
  };

  const handleRemoveUpload = (uploadId: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'primary';
      case 'processing': return 'warning';
      case 'encoding': return 'secondary';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return 'Uploading';
      case 'processing': return 'Processing';
      case 'encoding': return 'Encoding';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload Queue</h1>
        <Button 
          color="primary" 
          startContent={<Upload className="h-4 w-4" />}
          onPress={() => setShowUploadModal(true)}
        >
          Upload New Videos
        </Button>
      </div>

      {/* Upload Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600">{uploadQueue.filter(u => u.status === 'uploading').length}</div>
            <div className="text-sm text-gray-600">Uploading</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600">{uploadQueue.filter(u => u.status === 'processing' || u.status === 'encoding').length}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">{uploadQueue.filter(u => u.status === 'completed').length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-red-600">{uploadQueue.filter(u => u.status === 'failed').length}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Processing Queue ({uploadQueue.length} items)</h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <Table aria-label="Upload queue table">
              <TableHeader>
                <TableColumn>VIDEO</TableColumn>
                <TableColumn>SIZE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>PROGRESS</TableColumn>
                <TableColumn>UPLOADED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No uploads in queue">
                {uploadQueue.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Video className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{upload.title || upload.fileName}</p>
                          <p className="text-sm text-gray-500">{upload.fileName}</p>
                          {upload.duration && <p className="text-xs text-gray-400">{upload.duration}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{upload.size}</TableCell>
                    <TableCell>
                      <Chip color={getStatusColor(upload.status)} size="sm">
                        {getStatusText(upload.status)}
                      </Chip>
                      {upload.errorMessage && (
                        <p className="text-xs text-red-500 mt-1">{upload.errorMessage}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={upload.progress} className="w-20" />
                        <span className="text-sm">{upload.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(upload.uploadedAt).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {upload.status === 'failed' && (
                          <Button 
                            size="sm" 
                            color="primary" 
                            variant="light"
                            onPress={() => handleRetryUpload(upload.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          color="danger" 
                          variant="light"
                          onPress={() => handleRemoveUpload(upload.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Upload New Video</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Video Title"
                placeholder="Enter video title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              />
              <Textarea
                label="Description"
                placeholder="Enter video description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              />
              <Select
                label="Category"
                aria-label="Select video category"
                selectedKeys={[uploadForm.category]}
                onSelectionChange={(keys) => setUploadForm({ ...uploadForm, category: Array.from(keys)[0] as string })}
              >
                <SelectItem key="educational" value="educational">Educational</SelectItem>
                <SelectItem key="entertainment" value="entertainment">Entertainment</SelectItem>
                <SelectItem key="interactive" value="interactive">Interactive</SelectItem>
              </Select>
              <Input
                label="Price"
                type="number"
                placeholder="0.00"
                value={uploadForm.price.toString()}
                onChange={(e) => setUploadForm({ ...uploadForm, price: parseFloat(e.target.value) || 0 })}
                startContent={<span className="text-gray-500">$</span>}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    {uploadForm.videoFile ? uploadForm.videoFile.name : 'Click to select video file'}
                  </p>
                  <p className="text-sm text-gray-500">MP4, MOV, AVI up to 500MB</p>
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleUploadSubmit}>
              Start Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}