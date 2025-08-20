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
  Switch,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Tabs,
  Tab,
  Slider
} from '@nextui-org/react';
import {
  Users,
  Shield,
  Clock,
  Eye,
  EyeOff,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  Baby,
  User,
  UserCheck,
  Lock,
  Unlock,
  Timer,
  Video,
  Star,
  Filter,
  Calendar,
  Bell,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  description: string;
  color: string;
  icon: string;
  contentFilters: {
    allowedCategories: string[];
    blockedKeywords: string[];
    maxVideoLength: number;
    requireApproval: boolean;
  };
  timeRestrictions: {
    dailyLimit: number;
    weeklyLimit: number;
    allowedHours: {
      start: string;
      end: string;
    };
    weekendExtension: number;
  };
  features: {
    downloadEnabled: boolean;
    commentsEnabled: boolean;
    sharingEnabled: boolean;
    profileCustomization: boolean;
  };
  packageCount: number;
  activeUsers: number;
  createdAt: string;
  updatedAt: string;
}

interface ParentalControl {
  id: string;
  parentId: string;
  childId: string;
  childName: string;
  childAge: number;
  ageGroupId: string;
  settings: {
    screenTimeLimit: number;
    bedtimeRestriction: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    contentFiltering: {
      level: 'strict' | 'moderate' | 'relaxed';
      customBlocked: string[];
      allowedOnly: boolean;
    };
    deviceRestrictions: {
      allowedDevices: string[];
      maxConcurrentSessions: number;
    };
    notifications: {
      timeWarnings: boolean;
      contentAlerts: boolean;
      weeklyReports: boolean;
    };
  };
  usage: {
    todayMinutes: number;
    weekMinutes: number;
    monthMinutes: number;
    lastActive: string;
    favoriteCategories: string[];
    watchHistory: Array<{
      videoId: string;
      videoTitle: string;
      watchTime: number;
      completionRate: number;
      date: string;
    }>;
  };
  status: 'active' | 'restricted' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export default function AgeGroupsParentalControl() {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [parentalControls, setParentalControls] = useState<ParentalControl[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('age-groups');
  const [editingAgeGroup, setEditingAgeGroup] = useState<AgeGroup | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadAgeGroups();
    loadParentalControls();
  }, []);

  const loadAgeGroups = async () => {
    try {
      setLoading(true);
      const data = await vpsDataStore.loadData();
      
      // Load saved age groups or use defaults
      const savedAgeGroups = data.ageGroups || [];
      
      if (savedAgeGroups.length === 0) {
        // Initialize with default age groups
        const defaultAgeGroups: AgeGroup[] = [
          {
            id: 'toddlers',
            name: 'Toddlers',
            minAge: 2,
            maxAge: 4,
            description: 'Simple, colorful content for early development',
            color: 'pink',
            icon: 'baby',
            contentFilters: {
              allowedCategories: ['colors', 'shapes', 'animals', 'music'],
              blockedKeywords: ['scary', 'complex', 'advanced'],
              maxVideoLength: 10,
              requireApproval: true
            },
            timeRestrictions: {
              dailyLimit: 30,
              weeklyLimit: 180,
              allowedHours: {
                start: '09:00',
                end: '17:00'
              },
              weekendExtension: 15
            },
            features: {
              downloadEnabled: true,
              commentsEnabled: false,
              sharingEnabled: false,
              profileCustomization: false
            },
            packageCount: (data.packages || []).filter(p => p.ageGroups?.includes('2-4') || p.targetAge?.includes('toddlers')).length || 2,
            activeUsers: 12,
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'preschool',
            name: 'Preschool',
            minAge: 3,
            maxAge: 5,
            description: 'Educational content for preschool learning',
            color: 'blue',
            icon: 'user',
            contentFilters: {
              allowedCategories: ['alphabet', 'numbers', 'colors', 'shapes', 'animals', 'music', 'stories'],
              blockedKeywords: ['violence', 'scary', 'complex'],
              maxVideoLength: 15,
              requireApproval: false
            },
            timeRestrictions: {
              dailyLimit: 60,
              weeklyLimit: 360,
              allowedHours: {
                start: '08:00',
                end: '18:00'
              },
              weekendExtension: 30
            },
            features: {
              downloadEnabled: true,
              commentsEnabled: false,
              sharingEnabled: true,
              profileCustomization: true
            },
            packageCount: (data.packages || []).filter(p => p.ageGroups?.includes('3-5') || p.targetAge?.includes('preschool')).length || 3,
            activeUsers: 18,
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        // Save default age groups
        await saveAgeGroups(defaultAgeGroups);
        setAgeGroups(defaultAgeGroups);
      } else {
        setAgeGroups(savedAgeGroups);
      }
    } catch (error) {
      console.error('Error loading age groups:', error);
      setAgeGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAgeGroups = async (ageGroupsToSave: AgeGroup[]) => {
    try {
      const data = await vpsDataStore.loadData();
      data.ageGroups = ageGroupsToSave;
      await vpsDataStore.saveData(data);
      return true;
    } catch (error) {
      console.error('Error saving age groups:', error);
      return false;
    }
  };

  const handleSaveAgeGroup = async (ageGroup: AgeGroup) => {
    try {
      setLoading(true);
      let updatedAgeGroups;
      
      if (editingAgeGroup) {
        // Update existing age group
        updatedAgeGroups = ageGroups.map(ag => 
          ag.id === ageGroup.id ? { ...ageGroup, updatedAt: new Date().toISOString() } : ag
        );
      } else {
        // Add new age group
        const newAgeGroup = {
          ...ageGroup,
          id: `age_group_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedAgeGroups = [...ageGroups, newAgeGroup];
      }
      
      const success = await saveAgeGroups(updatedAgeGroups);
      if (success) {
        setAgeGroups(updatedAgeGroups);
        setEditingAgeGroup(null);
        onClose();
      }
    } catch (error) {
      console.error('Error saving age group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgeGroup = async (ageGroupId: string) => {
    try {
      setLoading(true);
      const updatedAgeGroups = ageGroups.filter(ag => ag.id !== ageGroupId);
      const success = await saveAgeGroups(updatedAgeGroups);
      if (success) {
        setAgeGroups(updatedAgeGroups);
      }
    } catch (error) {
      console.error('Error deleting age group:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParentalControls = async () => {
    try {
      let data;
      try {
        data = await vpsDataStore.loadData();
      } catch (error) {
        console.warn('Failed to load data for parental controls, using defaults:', error);
        data = { users: [] };
      }
      
      // Create mock parental controls data since User type doesn't have child role
      const realParentalControls: ParentalControl[] = [
        {
          id: 'pc_child_1',
          parentId: 'parent_1',
          childId: 'child_1',
          childName: 'Emma',
          childAge: 4,
          ageGroupId: 'toddlers',
          settings: {
            screenTimeLimit: 30,
            bedtimeRestriction: {
              enabled: true,
              startTime: '18:00',
              endTime: '07:00'
            },
            contentFiltering: {
              level: 'strict',
              customBlocked: [],
              allowedOnly: true
            },
            deviceRestrictions: {
              allowedDevices: ['tablet'],
              maxConcurrentSessions: 1
            },
            notifications: {
              timeWarnings: true,
              contentAlerts: true,
              weeklyReports: true
            }
          },
          usage: {
            todayMinutes: 25,
            weekMinutes: 180,
            monthMinutes: 720,
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            favoriteCategories: ['educational', 'music'],
            watchHistory: []
          },
          status: 'active',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pc_child_2',
          parentId: 'parent_1',
          childId: 'child_2',
          childName: 'Liam',
          childAge: 6,
          ageGroupId: 'preschool',
          settings: {
            screenTimeLimit: 60,
            bedtimeRestriction: {
              enabled: true,
              startTime: '19:00',
              endTime: '07:00'
            },
            contentFiltering: {
              level: 'moderate',
              customBlocked: [],
              allowedOnly: false
            },
            deviceRestrictions: {
              allowedDevices: ['tablet', 'smartphone'],
              maxConcurrentSessions: 1
            },
            notifications: {
              timeWarnings: true,
              contentAlerts: true,
              weeklyReports: true
            }
          },
          usage: {
            todayMinutes: 45,
            weekMinutes: 280,
            monthMinutes: 1100,
            lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            favoriteCategories: ['educational', 'entertainment'],
            watchHistory: []
          },
          status: 'active',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setParentalControls(realParentalControls);
    } catch (error) {
      console.error('Error loading parental controls:', error);
      setParentalControls([]);
    }
  };

  const getAgeGroupIcon = (icon: string) => {
    switch (icon) {
      case 'baby': return <Baby className="h-6 w-6" />;
      case 'user': return <User className="h-6 w-6" />;
      case 'user-check': return <UserCheck className="h-6 w-6" />;
      case 'users': return <Users className="h-6 w-6" />;
      default: return <User className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'restricted': return 'warning';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderAgeGroupsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Age Groups Management</h2>
          <p className="text-gray-600">Configure age-appropriate content and restrictions</p>
        </div>
        <Button 
          color="primary" 
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => {
            setEditingAgeGroup(null);
            onOpen();
          }}
        >
          Add Age Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ageGroups.map((ageGroup) => (
          <Card key={ageGroup.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${ageGroup.color}-100`}>
                    {getAgeGroupIcon(ageGroup.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{ageGroup.name}</h3>
                    <p className="text-sm text-gray-500">{ageGroup.minAge}-{ageGroup.maxAge} years</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="light"
                    onPress={() => {
                      setEditingAgeGroup(ageGroup);
                      onOpen();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="light" 
                    color="danger"
                    onPress={() => handleDeleteAgeGroup(ageGroup.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-gray-600 mb-4">{ageGroup.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Learning Packages</span>
                  <Chip color="primary" size="sm">{ageGroup.packageCount}</Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Active Users</span>
                  <Chip color="success" size="sm">{ageGroup.activeUsers}</Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Daily Limit</span>
                  <span className="text-sm font-medium">{formatTime(ageGroup.timeRestrictions.dailyLimit)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderParentalControlsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Parental Controls</h2>
          <p className="text-gray-600">Manage individual child accounts and restrictions</p>
        </div>
        <Button color="primary" startContent={<Plus className="h-4 w-4" />}>
          Add Child Profile
        </Button>
      </div>

      <Card>
        <CardBody>
          <Table 
            aria-label="Parental controls table"
            classNames={{
              wrapper: "min-h-[222px]",
              th: "bg-gray-50 text-gray-700 font-semibold",
              td: "border-b border-gray-200",
              table: "border border-gray-200 rounded-lg"
            }}
          >
            <TableHeader>
              <TableColumn>CHILD</TableColumn>
              <TableColumn>AGE GROUP</TableColumn>
              <TableColumn>TODAY'S USAGE</TableColumn>
              <TableColumn>SCREEN TIME LIMIT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>LAST ACTIVE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No child profiles found">
              {parentalControls.map((control) => {
                const ageGroup = ageGroups.find(ag => ag.id === control.ageGroupId);
                const usagePercentage = (control.usage.todayMinutes / control.settings.screenTimeLimit) * 100;
                
                return (
                  <TableRow key={control.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar name={control.childName} size="sm" />
                        <div>
                          <p className="font-medium">{control.childName}</p>
                          <p className="text-sm text-gray-500">{control.childAge} years old</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ageGroup && (
                        <Chip color="primary" size="sm" variant="flat">
                          {ageGroup.name}
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={Math.min(usagePercentage, 100)} 
                            className="w-16" 
                            size="sm"
                            color={usagePercentage > 90 ? 'danger' : usagePercentage > 70 ? 'warning' : 'success'}
                          />
                          <span className="text-sm">{formatTime(control.usage.todayMinutes)}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {Math.round(usagePercentage)}% of daily limit
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatTime(control.settings.screenTimeLimit)}</span>
                    </TableCell>
                    <TableCell>
                      <Chip color={getStatusColor(control.status)} size="sm">
                        {control.status.charAt(0).toUpperCase() + control.status.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(control.usage.lastActive).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(control.usage.lastActive).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="light" title="View Usage Details">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="light" title="Edit Settings">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light" 
                          color={control.status === 'active' ? 'warning' : 'success'}
                          title={control.status === 'active' ? 'Restrict Access' : 'Allow Access'}
                        >
                          {control.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );

  const renderAgeGroupModal = () => (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          {editingAgeGroup ? 'Edit Age Group' : 'Add New Age Group'}
        </ModalHeader>
        <ModalBody>
          <AgeGroupForm 
            ageGroup={editingAgeGroup}
            onSave={handleSaveAgeGroup}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Age Groups & Parental Control</h1>
          <p className="text-gray-600">Comprehensive child safety and content management system</p>
        </div>
      </div>

      <Tabs 
        selectedKey={activeTab} 
        onSelectionChange={(key) => setActiveTab(key as string)}
        className="w-full"
      >
        <Tab key="age-groups" title={
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Age Groups</span>
          </div>
        }>
          {renderAgeGroupsTab()}
        </Tab>
        
        <Tab key="parental-controls" title={
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Parental Controls</span>
          </div>
        }>
          {renderParentalControlsTab()}
        </Tab>
      </Tabs>
      
      {renderAgeGroupModal()}
    </div>
  );
}

// Age Group Form Component
function AgeGroupForm({ ageGroup, onSave, onCancel }: {
  ageGroup: AgeGroup | null;
  onSave: (ageGroup: AgeGroup) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<AgeGroup>>({});

  // Reset form data when ageGroup prop changes
  useEffect(() => {
    setFormData({
      name: ageGroup?.name || '',
      minAge: ageGroup?.minAge || 2,
      maxAge: ageGroup?.maxAge || 4,
      description: ageGroup?.description || '',
      color: ageGroup?.color || '',
      icon: ageGroup?.icon || '',
      contentFilters: ageGroup?.contentFilters || {
        allowedCategories: [],
        blockedKeywords: [],
        maxVideoLength: 15,
        requireApproval: false
      },
      timeRestrictions: ageGroup?.timeRestrictions || {
        dailyLimit: 60,
        weeklyLimit: 420,
        allowedHours: {
          start: '08:00',
          end: '18:00'
        },
        weekendExtension: 30
      },
      features: ageGroup?.features || {
        downloadEnabled: true,
        commentsEnabled: false,
        sharingEnabled: true,
        profileCustomization: true
      },
      packageCount: ageGroup?.packageCount || 0,
      activeUsers: ageGroup?.activeUsers || 0
    });
  }, [ageGroup]);

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.color) return;
    
    const ageGroupData: AgeGroup = {
      id: ageGroup?.id || '',
      name: formData.name,
      minAge: formData.minAge!,
      maxAge: formData.maxAge!,
      description: formData.description,
      color: formData.color!,
      icon: formData.icon!,
      contentFilters: formData.contentFilters!,
      timeRestrictions: formData.timeRestrictions!,
      features: formData.features!,
      packageCount: formData.packageCount!,
      activeUsers: formData.activeUsers!,
      createdAt: ageGroup?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(ageGroupData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter age group name"
        />
        <Select
          label="Color"
          placeholder="Select a color"
          selectedKeys={formData.color ? [formData.color] : []}
          onSelectionChange={(keys) => setFormData({ ...formData, color: Array.from(keys)[0] as string })}
        >
          <SelectItem key="blue" value="blue">Blue</SelectItem>
          <SelectItem key="pink" value="pink">Pink</SelectItem>
          <SelectItem key="green" value="green">Green</SelectItem>
          <SelectItem key="purple" value="purple">Purple</SelectItem>
          <SelectItem key="orange" value="orange">Orange</SelectItem>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Min Age"
          value={formData.minAge?.toString()}
          onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) })}
        />
        <Input
          type="number"
          label="Max Age"
          value={formData.maxAge?.toString()}
          onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) })}
        />
      </div>
      
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Describe this age group"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Daily Limit (minutes)"
          value={formData.timeRestrictions?.dailyLimit?.toString()}
          onChange={(e) => setFormData({ 
            ...formData, 
            timeRestrictions: { 
              ...formData.timeRestrictions!, 
              dailyLimit: parseInt(e.target.value) 
            }
          })}
        />
        <Input
          type="number"
          label="Max Video Length (minutes)"
          value={formData.contentFilters?.maxVideoLength?.toString()}
          onChange={(e) => setFormData({ 
            ...formData, 
            contentFilters: { 
              ...formData.contentFilters!, 
              maxVideoLength: parseInt(e.target.value) 
            }
          })}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="light" onPress={onCancel}>
          Cancel
        </Button>
        <Button 
          color="primary" 
          onPress={handleSubmit}
          isDisabled={!formData.name || !formData.description || !formData.color}
        >
          {ageGroup ? 'Update' : 'Create'} Age Group
        </Button>
      </div>
    </div>
  );
}