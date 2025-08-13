import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Accordion,
  AccordionItem
} from '@nextui-org/react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  FileText,
  Image as ImageIcon,
  Video,
  Headphones,
  Award,
  Target,
  Clock,
  Users,
  Star,
  CheckCircle,
  Lock,
  Unlock
} from 'lucide-react';

interface PP1Lesson {
  id: string;
  title: string;
  description: string;
  contentType: 'video' | 'audio' | 'text' | 'interactive' | 'quiz';
  contentUrl?: string;
  duration: string;
  difficulty: 'beginner';
  order: number;
  isLocked: boolean;
  prerequisites: string[];
  objectives: string[];
  materials: string[];
  transcript?: string;
  thumbnail?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PP1Module {
  id: string;
  title: string;
  description: string;
  lessons: PP1Lesson[];
  order: number;
  estimatedDuration: string;
  completionRate: number;
  isActive: boolean;
}

interface PP1ProgramManagerProps {
  modules: PP1Module[];
  onAddModule: (module: Omit<PP1Module, 'id'>) => Promise<boolean>;
  onUpdateModule: (id: string, module: Partial<PP1Module>) => Promise<boolean>;
  onDeleteModule: (id: string) => Promise<boolean>;
  onAddLesson: (moduleId: string, lesson: Omit<PP1Lesson, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onUpdateLesson: (moduleId: string, lessonId: string, lesson: Partial<PP1Lesson>) => Promise<boolean>;
  onDeleteLesson: (moduleId: string, lessonId: string) => Promise<boolean>;
}

export const PP1ProgramManager: React.FC<PP1ProgramManagerProps> = ({
  modules,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState<PP1Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<PP1Lesson | null>(null);
  
  const { isOpen: isModuleModalOpen, onOpen: onModuleModalOpen, onClose: onModuleModalClose } = useDisclosure();
  const { isOpen: isLessonModalOpen, onOpen: onLessonModalOpen, onClose: onLessonModalClose } = useDisclosure();
  const { isOpen: isPreviewModalOpen, onOpen: onPreviewModalOpen, onClose: onPreviewModalClose } = useDisclosure();

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1,
    estimatedDuration: '',
    isActive: true
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    contentType: 'video' as 'video' | 'audio' | 'text' | 'interactive' | 'quiz',
    contentUrl: '',
    duration: '',
    order: 1,
    isLocked: false,
    prerequisites: '',
    objectives: '',
    materials: '',
    transcript: '',
    thumbnail: ''
  });

  const [editingModule, setEditingModule] = useState<PP1Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<PP1Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string>('');

  const resetModuleForm = () => {
    setModuleForm({
      title: '',
      description: '',
      order: modules.length + 1,
      estimatedDuration: '',
      isActive: true
    });
    setEditingModule(null);
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      description: '',
      contentType: 'video',
      contentUrl: '',
      duration: '',
      order: 1,
      isLocked: false,
      prerequisites: '',
      objectives: '',
      materials: '',
      transcript: '',
      thumbnail: ''
    });
    setEditingLesson(null);
  };

  const handleSaveModule = async () => {
    if (!moduleForm.title.trim()) {
      alert('Please enter a module title');
      return;
    }

    const moduleData = {
      title: moduleForm.title,
      description: moduleForm.description,
      lessons: editingModule?.lessons || [],
      order: moduleForm.order,
      estimatedDuration: moduleForm.estimatedDuration,
      completionRate: 0,
      isActive: moduleForm.isActive
    };

    let success = false;
    if (editingModule) {
      success = await onUpdateModule(editingModule.id, moduleData);
    } else {
      success = await onAddModule(moduleData);
    }

    if (success) {
      resetModuleForm();
      onModuleModalClose();
    }
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim() || !currentModuleId) {
      alert('Please fill in required fields');
      return;
    }

    const lessonData = {
      title: lessonForm.title,
      description: lessonForm.description,
      contentType: lessonForm.contentType,
      contentUrl: lessonForm.contentUrl,
      duration: lessonForm.duration,
      difficulty: 'beginner' as const,
      order: lessonForm.order,
      isLocked: lessonForm.isLocked,
      prerequisites: lessonForm.prerequisites.split(',').map(p => p.trim()).filter(p => p),
      objectives: lessonForm.objectives.split(',').map(o => o.trim()).filter(o => o),
      materials: lessonForm.materials.split(',').map(m => m.trim()).filter(m => m),
      transcript: lessonForm.transcript,
      thumbnail: lessonForm.thumbnail,
      completed: false
    };

    let success = false;
    if (editingLesson) {
      success = await onUpdateLesson(currentModuleId, editingLesson.id, lessonData);
    } else {
      success = await onAddLesson(currentModuleId, lessonData);
    }

    if (success) {
      resetLessonForm();
      onLessonModalClose();
    }
  };

  const handleEditModule = (module: PP1Module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description,
      order: module.order,
      estimatedDuration: module.estimatedDuration,
      isActive: module.isActive
    });
    onModuleModalOpen();
  };

  const handleEditLesson = (moduleId: string, lesson: PP1Lesson) => {
    setEditingLesson(lesson);
    setCurrentModuleId(moduleId);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      contentType: lesson.contentType,
      contentUrl: lesson.contentUrl || '',
      duration: lesson.duration,
      order: lesson.order,
      isLocked: lesson.isLocked,
      prerequisites: lesson.prerequisites.join(', '),
      objectives: lesson.objectives.join(', '),
      materials: lesson.materials.join(', '),
      transcript: lesson.transcript || '',
      thumbnail: lesson.thumbnail || ''
    });
    onLessonModalOpen();
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'interactive': return <Target className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'primary';
      case 'audio': return 'secondary';
      case 'text': return 'success';
      case 'interactive': return 'warning';
      case 'quiz': return 'danger';
      default: return 'default';
    }
  };

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = modules.reduce((total, module) => 
    total + module.lessons.filter(lesson => lesson.completed).length, 0
  );
  const averageCompletion = modules.length > 0 
    ? modules.reduce((total, module) => total + module.completionRate, 0) / modules.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PP1 Program (Beginner Level)</h2>
          <p className="text-gray-600">Structured learning program for beginners</p>
        </div>
        <Button
          className="bg-green-600 text-white hover:bg-green-700"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => {
            resetModuleForm();
            onModuleModalOpen();
          }}
        >
          Add Module
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                <p className="text-sm text-gray-600">Modules</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
                <p className="text-sm text-gray-600">Total Lessons</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{averageCompletion.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Avg Completion</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
        <Tab key="overview" title="Program Overview">
          <div className="space-y-6">
            {/* Modules List */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Learning Modules</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <Card key={module.id} className="border border-gray-200">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-green-600">{index + 1}</span>
                              </div>
                              <h4 className="font-semibold text-gray-900">{module.title}</h4>
                              <Chip
                                size="sm"
                                color={module.isActive ? 'success' : 'default'}
                                variant="flat"
                              >
                                {module.isActive ? 'Active' : 'Inactive'}
                              </Chip>
                            </div>
                            <p className="text-gray-600 mb-3">{module.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{module.lessons.length} lessons</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{module.estimatedDuration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>{module.completionRate.toFixed(1)}% completion</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <Progress
                                value={module.completionRate}
                                color="success"
                                size="sm"
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => {
                                setSelectedModule(module);
                                setActiveTab('lessons');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => handleEditModule(module)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => {
                                if (confirm(`Delete module "${module.title}"?`)) {
                                  onDeleteModule(module.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}

                  {modules.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
                      <p className="text-gray-600 mb-4">Create your first PP1 program module to get started.</p>
                      <Button
                        color="primary"
                        onPress={() => {
                          resetModuleForm();
                          onModuleModalOpen();
                        }}
                        startContent={<Plus className="h-4 w-4" />}
                      >
                        Add First Module
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="lessons" title="Lesson Management">
          <div className="space-y-6">
            {selectedModule ? (
              <>
                {/* Module Header */}
                <Card>
                  <CardBody className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedModule.title}</h3>
                        <p className="text-gray-600">{selectedModule.description}</p>
                      </div>
                      <Button
                        color="primary"
                        startContent={<Plus className="h-4 w-4" />}
                        onPress={() => {
                          setCurrentModuleId(selectedModule.id);
                          resetLessonForm();
                          onLessonModalOpen();
                        }}
                      >
                        Add Lesson
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                {/* Lessons Table */}
                <Card>
                  <CardHeader>
                    <h4 className="text-lg font-semibold">Lessons ({selectedModule.lessons.length})</h4>
                  </CardHeader>
                  <CardBody className="p-0">
                    <Table removeWrapper>
                      <TableHeader>
                        <TableColumn>ORDER</TableColumn>
                        <TableColumn>LESSON</TableColumn>
                        <TableColumn>TYPE</TableColumn>
                        <TableColumn>DURATION</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {selectedModule.lessons
                          .sort((a, b) => a.order - b.order)
                          .map((lesson) => (
                          <TableRow key={lesson.id}>
                            <TableCell>
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{lesson.order}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {lesson.isLocked ? (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Unlock className="h-4 w-4 text-green-500" />
                                )}
                                <div>
                                  <p className="font-medium">{lesson.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {lesson.description.substring(0, 50)}...
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                color={getContentTypeColor(lesson.contentType) as any}
                                variant="flat"
                                startContent={getContentTypeIcon(lesson.contentType)}
                              >
                                {lesson.contentType}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{lesson.duration}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                color={lesson.completed ? 'success' : 'default'}
                                variant="flat"
                              >
                                {lesson.completed ? 'Completed' : 'Pending'}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="light"
                                  onPress={() => {
                                    setSelectedLesson(lesson);
                                    onPreviewModalOpen();
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="light"
                                  onPress={() => handleEditLesson(selectedModule.id, lesson)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="light"
                                  onPress={() => {
                                    if (confirm(`Delete lesson "${lesson.title}"?`)) {
                                      onDeleteLesson(selectedModule.id, lesson.id);
                                    }
                                  }}
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
              </>
            ) : (
              <Card>
                <CardBody className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a module</h3>
                  <p className="text-gray-600">Choose a module from the overview tab to manage its lessons.</p>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
      </Tabs>

      {/* Add/Edit Module Modal */}
      <Modal isOpen={isModuleModalOpen} onClose={onModuleModalClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {editingModule ? 'Edit Module' : 'Add New Module'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Module Title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                isRequired
              />
              
              <Textarea
                label="Description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Order"
                  type="number"
                  value={moduleForm.order.toString()}
                  onChange={(e) => setModuleForm({...moduleForm, order: parseInt(e.target.value) || 1})}
                />
                
                <Input
                  label="Estimated Duration"
                  value={moduleForm.estimatedDuration}
                  onChange={(e) => setModuleForm({...moduleForm, estimatedDuration: e.target.value})}
                  placeholder="e.g., 2 hours"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={moduleForm.isActive}
                  onChange={(e) => setModuleForm({...moduleForm, isActive: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Module is active
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModuleModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveModule}
              isDisabled={!moduleForm.title.trim()}
            >
              {editingModule ? 'Update' : 'Create'} Module
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add/Edit Lesson Modal */}
      <Modal isOpen={isLessonModalOpen} onClose={onLessonModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Lesson Title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                isRequired
              />
              
              <Textarea
                label="Description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                rows={3}
              />

              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Content Type"
                  selectedKeys={[lessonForm.contentType]}
                  onSelectionChange={(keys) => setLessonForm({...lessonForm, contentType: Array.from(keys)[0] as any})}
                >
                  <SelectItem key="video">Video</SelectItem>
                  <SelectItem key="audio">Audio</SelectItem>
                  <SelectItem key="text">Text</SelectItem>
                  <SelectItem key="interactive">Interactive</SelectItem>
                  <SelectItem key="quiz">Quiz</SelectItem>
                </Select>

                <Input
                  label="Order"
                  type="number"
                  value={lessonForm.order.toString()}
                  onChange={(e) => setLessonForm({...lessonForm, order: parseInt(e.target.value) || 1})}
                />

                <Input
                  label="Duration"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                  placeholder="e.g., 15 min"
                />
              </div>

              <Input
                label="Content URL"
                value={lessonForm.contentUrl}
                onChange={(e) => setLessonForm({...lessonForm, contentUrl: e.target.value})}
                placeholder="https://..."
              />

              <div className="grid grid-cols-2 gap-4">
                <Textarea
                  label="Learning Objectives"
                  value={lessonForm.objectives}
                  onChange={(e) => setLessonForm({...lessonForm, objectives: e.target.value})}
                  placeholder="Comma separated objectives"
                  rows={2}
                />

                <Textarea
                  label="Required Materials"
                  value={lessonForm.materials}
                  onChange={(e) => setLessonForm({...lessonForm, materials: e.target.value})}
                  placeholder="Comma separated materials"
                  rows={2}
                />
              </div>

              <Textarea
                label="Prerequisites"
                value={lessonForm.prerequisites}
                onChange={(e) => setLessonForm({...lessonForm, prerequisites: e.target.value})}
                placeholder="Comma separated lesson IDs or titles"
                rows={2}
              />

              <Textarea
                label="Transcript (optional)"
                value={lessonForm.transcript}
                onChange={(e) => setLessonForm({...lessonForm, transcript: e.target.value})}
                rows={4}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isLocked"
                  checked={lessonForm.isLocked}
                  onChange={(e) => setLessonForm({...lessonForm, isLocked: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="isLocked" className="text-sm font-medium">
                  Lesson is locked (requires prerequisites)
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onLessonModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveLesson}
              isDisabled={!lessonForm.title.trim()}
            >
              {editingLesson ? 'Update' : 'Create'} Lesson
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Lesson Preview Modal */}
      <Modal isOpen={isPreviewModalOpen} onClose={onPreviewModalClose} size="3xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              {selectedLesson && getContentTypeIcon(selectedLesson.contentType)}
              <div>
                <h3 className="font-semibold">{selectedLesson?.title}</h3>
                <p className="text-sm text-gray-500">Lesson Preview</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedLesson && (
              <div className="space-y-6">
                {/* Lesson Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedLesson.contentType}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {selectedLesson.duration}
                    </div>
                    <div>
                      <span className="font-medium">Order:</span> #{selectedLesson.order}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Chip size="sm" color={selectedLesson.isLocked ? 'warning' : 'success'} variant="flat" className="ml-2">
                        {selectedLesson.isLocked ? 'Locked' : 'Unlocked'}
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedLesson.description}</p>
                </div>

                {/* Learning Objectives */}
                {selectedLesson.objectives.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Learning Objectives</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedLesson.objectives.map((objective, index) => (
                        <li key={index} className="text-gray-600">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Materials */}
                {selectedLesson.materials.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Required Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLesson.materials.map((material, index) => (
                        <Chip key={index} size="sm" variant="flat">
                          {material}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites */}
                {selectedLesson.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Prerequisites</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLesson.prerequisites.map((prereq, index) => (
                        <Chip key={index} size="sm" color="warning" variant="flat">
                          {prereq}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                {selectedLesson.contentUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Content</h4>
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        {getContentTypeIcon(selectedLesson.contentType)}
                        <span>Content available at: {selectedLesson.contentUrl}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onPreviewModalClose}>
              Close
            </Button>
            {selectedLesson?.contentUrl && (
              <Button
                color="primary"
                onPress={() => window.open(selectedLesson.contentUrl, '_blank')}
                startContent={<Play className="h-4 w-4" />}
              >
                Open Content
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};