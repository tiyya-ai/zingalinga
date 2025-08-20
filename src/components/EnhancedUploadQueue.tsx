'use client';

import React, { useState, useEffect } from 'react';
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
  useDisclosure,
  Chip,
  Progress,
} from '@nextui-org/react';
import {
  Upload,
  Video,
  Plus,
  X,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { vpsDataStore, UploadQueueItem } from '../utils/vpsDataStore';
import { processRealUpload } from '../utils/uploadUtils';

interface EnhancedUploadQueueProps {
  loadVideos: () => Promise<void>;
}

export default function EnhancedUploadQueue({ loadVideos }: EnhancedUploadQueueProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOpen: isUploadModalOpen, onOpen: onUploadModalOpen, onClose: onUploadModalClose } = useDisclosure();
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    videoFile: null as File | null,
    category: 'educational'
  });

  // Load upload queue on component mount
  useEffect(() => {
    loadUploadQueue();
  }, []);

  const loadUploadQueue = async () => {
    try {
      setLoading(true);
      const queue = await vpsDataStore.getUploadQueue();
      setUploadQueue(queue);
    } catch (error) {
      console.error('Error loading upload queue:', error);
      setUploadQueue([]);
    } finally {
      setLoading(false);
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

    const uploadId = Date.now().toString();
    const newUpload: UploadQueueItem = {
      id: uploadId,
      fileName: uploadForm.videoFile.name,
      title: uploadForm.title,
      size: `${Math.round(uploadForm.videoFile.size / (1024 * 1024))} MB`,
      status: 'uploading',
      progress: 0,
      uploadedAt: new Date().toISOString(),
      duration: '0:00',
      formData: uploadForm
    };

    // Add to data store
    await vpsDataStore.addToUploadQueue(newUpload);
    
    // Update local state
    setUploadQueue(prev => [newUpload, ...prev]);
    
    // Close modal and reset form
    onUploadModalClose();
    setUploadForm({
      title: '',
      description: '',
      videoFile: null,
      category: 'educational'
    });

    // Start the real upload process
    processRealUpload(uploadId, uploadForm as any, updateUploadQueueState, loadVideos);
  };

  const updateUploadQueueState = (updateFn: (prev: UploadQueueItem[]) => UploadQueueItem[]) => {
    setUploadQueue(updateFn);
  };

  const handleRetryUpload = async (uploadId: string) => {
    const uploadItem = uploadQueue.find(item => item.id === uploadId);
    if (uploadItem && uploadItem.formData) {
      // Update status to uploading
      await vpsDataStore.updateUploadQueueItem(uploadId, { 
        status: 'uploading', 
        progress: 0, 
        errorMessage: undefined 
      });
      
      // Update local state
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId 
          ? { ...item, status: 'uploading', progress: 0, errorMessage: undefined }
          : item
      ));

      // Restart upload process
      processRealUpload(uploadId, uploadItem.formData as any, updateUploadQueueState, loadVideos);
    }
  };

  const handleRemoveUpload = async (uploadId: string) => {
    await vpsDataStore.removeFromUploadQueue(uploadId);
    setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
  };

  const handleClearCompleted = async () => {
    await vpsDataStore.clearCompletedUploads();
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Upload className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'encoding': return <Video className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  const completedCount = uploadQueue.filter(u => u.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload Queue</h1>
        <div className="flex space-x-2">
          <Button 
            color="primary" 
            startContent={<Upload className="h-4 w-4" />}
            onPress={onUploadModalOpen}
          >
            Upload New Video
          </Button>
          {completedCount > 0 && (
            <Button 
              color="secondary" 
              variant="flat"
              startContent={<Trash2 className="h-4 w-4" />}
              onPress={handleClearCompleted}
            >
              Clear Completed ({completedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Upload Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {uploadQueue.filter(u => u.status === 'uploading').length}
            </div>
            <div className="text-sm text-gray-600">Uploading</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {uploadQueue.filter(u => u.status === 'processing' || u.status === 'encoding').length}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {uploadQueue.filter(u => u.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {uploadQueue.filter(u => u.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardBody>
        </Card>
      </div>

      {/* Upload Queue Table */}
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
              <TableBody emptyContent={loading ? "Loading..." : "No uploads in queue"}>
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
                      <Chip 
                        color={getStatusColor(upload.status)} 
                        size="sm"
                        startContent={getStatusIcon(upload.status)}
                      >
                        {getStatusText(upload.status)}
                      </Chip>
                      {upload.errorMessage && (
                        <p className="text-xs text-red-500 mt-1">{upload.errorMessage}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={upload.progress} 
                          className="w-20"
                          color={upload.status === 'failed' ? 'danger' : 'primary'}
                        />
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
                            title="Retry Upload"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          color="danger" 
                          variant="light"
                          onPress={() => handleRemoveUpload(upload.id)}
                          title="Remove from Queue"
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
      <Modal isOpen={isUploadModalOpen} onClose={onUploadModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>Upload New Video</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Video Title"
                placeholder="Enter video title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                isRequired
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
            <Button variant="light" onPress={onUploadModalClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleUploadSubmit}
              isDisabled={!uploadForm.videoFile || !uploadForm.title}
            >
              Start Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}