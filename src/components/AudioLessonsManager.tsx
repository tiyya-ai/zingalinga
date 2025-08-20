import React, { useState, useRef, useEffect } from 'react';
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
  Slider
} from '@nextui-org/react';
import {
  Headphones,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  Star,
  Download,
  SkipBack,
  SkipForward
} from 'lucide-react';

interface AudioLesson {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  accessLevel: 'free' | 'paid' | 'premium';
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

interface AudioLessonsManagerProps {
  lessons: AudioLesson[];
  onAddLesson: (lesson: Omit<AudioLesson, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onUpdateLesson: (id: string, lesson: Partial<AudioLesson>) => Promise<boolean>;
  onDeleteLesson: (id: string) => Promise<boolean>;
}

export const AudioLessonsManager: React.FC<AudioLessonsManagerProps> = ({
  lessons,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson
}) => {
  const [selectedLesson, setSelectedLesson] = useState<AudioLesson | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isPlayerOpen, onOpen: onPlayerOpen, onClose: onPlayerClose } = useDisclosure();

  // Audio form state
  const [audioForm, setAudioForm] = useState({
    title: '',
    description: '',
    audioUrl: '',
    duration: '',
    accessLevel: 'paid' as 'free' | 'paid' | 'premium',
    thumbnail: '',
    tags: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    transcript: '',
    hasPreview: false,
    previewUrl: ''
  });

  const [editingLesson, setEditingLesson] = useState<AudioLesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  // Audio player functions
  const playAudio = (lesson: AudioLesson) => {
    if (audioRef.current) {
      if (isPlaying === lesson.id) {
        audioRef.current.pause();
        setIsPlaying(null);
      } else {
        audioRef.current.src = lesson.audioUrl;
        audioRef.current.play();
        setIsPlaying(lesson.id);
        setSelectedLesson(lesson);
        onPlayerOpen();
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(selectedLesson?.id || null);
      } else {
        audioRef.current.pause();
        setIsPlaying(null);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number | number[]) => {
    const seekTime = Array.isArray(value) ? value[0] : value;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid audio file (MP3, WAV, M4A, AAC)');
        return;
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Audio file size must be less than 50MB');
        return;
      }

      const audioUrl = URL.createObjectURL(file);
      
      // Get duration
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        setAudioForm(prev => ({ 
          ...prev, 
          audioUrl: audioUrl,
          duration: formattedDuration 
        }));
        URL.revokeObjectURL(audio.src);
      };
      audio.src = audioUrl;
    }
  };

  const handleSaveLesson = async () => {
    if (!audioForm.title.trim() || !audioForm.audioUrl) {
      alert('Please fill in required fields');
      return;
    }

    const lessonData = {
      title: audioForm.title,
      description: audioForm.description,
      audioUrl: audioForm.audioUrl,
      duration: audioForm.duration,

      accessLevel: audioForm.accessLevel,
      thumbnail: audioForm.thumbnail,
      tags: audioForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      category: 'Audio Lessons',
      difficulty: audioForm.difficulty,
      transcript: audioForm.transcript,
      hasPreview: audioForm.hasPreview,
      previewUrl: audioForm.previewUrl
    };

    let success = false;
    if (editingLesson) {
      success = await onUpdateLesson(editingLesson.id, lessonData);
    } else {
      success = await onAddLesson(lessonData);
    }

    if (success) {
      resetForm();
      onModalClose();
    }
  };

  const resetForm = () => {
    setAudioForm({
      title: '',
      description: '',
      audioUrl: '',
      duration: '',
      accessLevel: 'paid',
      thumbnail: '',
      tags: '',
      difficulty: 'beginner',
      transcript: '',
      hasPreview: false,
      previewUrl: ''
    });
    setEditingLesson(null);
  };

  const handleEdit = (lesson: AudioLesson) => {
    setEditingLesson(lesson);
    setAudioForm({
      title: lesson.title,
      description: lesson.description,
      audioUrl: lesson.audioUrl,
      duration: lesson.duration,
      accessLevel: lesson.accessLevel,
      thumbnail: lesson.thumbnail || '',
      tags: lesson.tags.join(', '),
      difficulty: lesson.difficulty,
      transcript: lesson.transcript || '',
      hasPreview: lesson.hasPreview,
      previewUrl: lesson.previewUrl || ''
    });
    onModalOpen();
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || lesson.difficulty === filterLevel;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audio Lessons</h2>
          <p className="text-gray-600">Manage your audio educational content</p>
        </div>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => {
            resetForm();
            onModalOpen();
          }}
        >
          Add Audio Lesson
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4">
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              startContent={<Headphones className="h-4 w-4" />}
            />
            <Select
              selectedKeys={[filterLevel]}
              onSelectionChange={(keys) => setFilterLevel(Array.from(keys)[0] as string)}
              className="w-48"
              placeholder="Filter by level"
            >
              <SelectItem key="all">All Levels</SelectItem>
              <SelectItem key="beginner">Beginner</SelectItem>
              <SelectItem key="intermediate">Intermediate</SelectItem>
              <SelectItem key="advanced">Advanced</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Lessons Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Audio Lessons ({filteredLessons.length})</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table removeWrapper>
            <TableHeader>
              <TableColumn>LESSON</TableColumn>
              <TableColumn>DURATION</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn>LEVEL</TableColumn>
              <TableColumn>ACCESS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Headphones className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-gray-500">{lesson.description.substring(0, 50)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm">{lesson.duration}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      {lesson.price === 0 ? 'Free' : `$${lesson.price}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={
                        lesson.difficulty === 'beginner' ? 'success' :
                        lesson.difficulty === 'intermediate' ? 'warning' : 'danger'
                      }
                      variant="flat"
                    >
                      {lesson.difficulty}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={
                        lesson.accessLevel === 'free' ? 'success' :
                        lesson.accessLevel === 'premium' ? 'secondary' : 'primary'
                      }
                      variant="flat"
                    >
                      {lesson.accessLevel}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => playAudio(lesson)}
                        className="min-w-8 h-8"
                      >
                        {isPlaying === lesson.id ? 
                          <Pause className="h-4 w-4 text-blue-600" /> : 
                          <Play className="h-4 w-4 text-blue-600" />
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(lesson)}
                        className="min-w-8 h-8"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => {
                          if (confirm(`Delete "${lesson.title}"?`)) {
                            onDeleteLesson(lesson.id);
                          }
                        }}
                        className="min-w-8 h-8"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingLesson ? 'Edit Audio Lesson' : 'Add New Audio Lesson'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Title"
                value={audioForm.title}
                onChange={(e) => setAudioForm({...audioForm, title: e.target.value})}
                isRequired
              />
              
              <Textarea
                label="Description"
                value={audioForm.description}
                onChange={(e) => setAudioForm({...audioForm, description: e.target.value})}
                rows={3}
              />

              <div className="grid grid-cols-1 gap-4">
                
                <Select
                  label="Difficulty Level"
                  selectedKeys={[audioForm.difficulty]}
                  onSelectionChange={(keys) => setAudioForm({...audioForm, difficulty: Array.from(keys)[0] as any})}
                >
                  <SelectItem key="beginner">Beginner</SelectItem>
                  <SelectItem key="intermediate">Intermediate</SelectItem>
                  <SelectItem key="advanced">Advanced</SelectItem>
                </Select>
              </div>

              <Select
                label="Access Level"
                selectedKeys={[audioForm.accessLevel]}
                onSelectionChange={(keys) => setAudioForm({...audioForm, accessLevel: Array.from(keys)[0] as any})}
              >
                <SelectItem key="free">Free</SelectItem>
                <SelectItem key="paid">Paid</SelectItem>
                <SelectItem key="premium">Premium</SelectItem>
              </Select>

              <div className="space-y-2">
                <label className="text-sm font-medium">Audio File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {audioForm.audioUrl ? (
                    <div className="space-y-2">
                      <Headphones className="h-8 w-8 text-green-600 mx-auto" />
                      <p className="text-sm text-green-600">Audio file uploaded</p>
                      <p className="text-xs text-gray-500">Duration: {audioForm.duration}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">Click to upload audio file</p>
                      <p className="text-xs text-gray-500">MP3, WAV, M4A, AAC (max 50MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <Input
                label="Tags (comma separated)"
                value={audioForm.tags}
                onChange={(e) => setAudioForm({...audioForm, tags: e.target.value})}
                placeholder="education, kids, beginner"
              />

              <Textarea
                label="Transcript (optional)"
                value={audioForm.transcript}
                onChange={(e) => setAudioForm({...audioForm, transcript: e.target.value})}
                rows={4}
                placeholder="Add transcript for accessibility..."
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveLesson}
              isDisabled={!audioForm.title.trim() || !audioForm.audioUrl}
            >
              {editingLesson ? 'Update' : 'Create'} Lesson
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Audio Player Modal */}
      <Modal isOpen={isPlayerOpen} onClose={onPlayerClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Headphones className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold">{selectedLesson?.title}</h3>
                <p className="text-sm text-gray-500">Audio Player</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedLesson && (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    onChange={handleSeek}
                    maxValue={duration}
                    step={1}
                    className="w-full"
                    color="primary"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                      }
                    }}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="lg"
                    color="primary"
                    onPress={togglePlayPause}
                    className="w-16 h-16 rounded-full"
                  >
                    {isPlaying ? 
                      <Pause className="h-6 w-6" /> : 
                      <Play className="h-6 w-6" />
                    }
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
                      }
                    }}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="light"
                    onPress={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onChange={handleVolumeChange}
                    maxValue={1}
                    step={0.1}
                    className="flex-1"
                    color="secondary"
                  />
                </div>

                {/* Lesson Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">About this lesson</h4>
                  <p className="text-sm text-gray-600">{selectedLesson.description}</p>
                  {selectedLesson.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedLesson.tags.map((tag, index) => (
                        <Chip key={index} size="sm" variant="flat">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(null)}
        preload="metadata"
      />
    </div>
  );
};