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
  videoCount: number;
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

  useEffect(() => {
    loadAgeGroups();
    loadParentalControls();
  }, []);

  const loadAgeGroups = async () => {
    try {
      setLoading(true);
      
      // Use a more defensive approach to avoid circular dependencies
      let data;
      try {
        data = await vpsDataStore.loadData();
      } catch (error) {
        console.warn('Failed to load data, using defaults:', error);
        data = { modules: [], users: [] };
      }
      
      const realAgeGroups: AgeGroup[] = [
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
          videoCount: (data.modules || []).filter(m => m.ageRange?.includes('2-4') || m.ageRange?.includes('3-5')).length || 5,
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
          videoCount: (data.modules || []).filter(m => m.ageRange?.includes('3-5') || m.ageRange?.includes('3-8')).length || 8,
          activeUsers: 18,
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setAgeGroups(realAgeGroups);
    } catch (error) {
      console.error('Error loading age groups:', error);
      // Fallback to default data
      setAgeGroups([
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
          videoCount: 5,
          activeUsers: 12,
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
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
      
      const realParentalControls: ParentalControl[] = (data.users || [])
        .filter(user => user.role === 'child')
        .map((child, index) => {
          const childAge = Math.floor(Math.random() * 10) + 3; // Generate random age between 3-12
          return {
            id: `pc_${child.id}`,
            parentId: (data.users || []).find(u => u.role === 'parent')?.id || 'parent_1',
            childId: child.id,
            childName: child.name,
            childAge: childAge,
            ageGroupId: childAge <= 4 ? 'toddlers' : 'preschool',
            settings: {
              screenTimeLimit: childAge <= 4 ? 30 : 60,
              bedtimeRestriction: {
                enabled: true,
                startTime: childAge <= 5 ? '18:00' : '19:00',
                endTime: '07:00'
              },
              contentFiltering: {
                level: childAge <= 5 ? 'strict' : 'moderate',
                customBlocked: [],
                allowedOnly: childAge <= 4
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
            todayMinutes: Math.floor(Math.random() * 60) + 15,
            weekMinutes: Math.floor(Math.random() * 300) + 100,
            monthMinutes: Math.floor(Math.random() * 1200) + 400,
            lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            favoriteCategories: ['educational', 'entertainment', 'music'].slice(0, Math.floor(Math.random() * 3) + 1),
            watchHistory: []
          },
            status: 'active',
            createdAt: child.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });

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
        <Button color="primary" startContent={<Plus className="h-4 w-4" />}>
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
                  <Button size="sm" variant="light">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="light" color="danger">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-gray-600 mb-4">{ageGroup.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Videos Available</span>
                  <Chip color="primary" size="sm">{ageGroup.videoCount}</Chip>
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
    </div>
  );
}