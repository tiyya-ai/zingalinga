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
  Spinner
} from '@nextui-org/react';
import {
  Settings,
  Globe,
  Shield,
  Database,
  Mail,
  Video,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Bell
} from 'lucide-react';
import { platformStatsCalculator, PlatformStatistics } from '../utils/platformStats';


interface GeneralSettingsData {
  platform: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
    defaultLanguage: string;
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  features: {
    userRegistration: boolean;
    emailVerification: boolean;
    videoComments: boolean;
    videoDownloads: boolean;
    socialSharing: boolean;
    parentalControls: boolean;
    offlineMode: boolean;
    multiLanguage: boolean;
  };
  limits: {
    maxVideoSize: number;
    maxUsersPerAccount: number;
    sessionTimeout: number;
    maxChildrenPerAccount: number;
    dailyVideoLimit: number;
    maxDownloadsPerDay: number;
  };
  security: {
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
    passwordMinLength: number;
    sessionSecurity: boolean;
    ipWhitelist: boolean;
    maintenanceMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    systemAlerts: boolean;
  };
  content: {
    autoModeration: boolean;
    contentFiltering: boolean;
    ageVerification: boolean;
    allowedVideoFormats: string[];
    maxVideoLength: number;
    thumbnailGeneration: boolean;
  };
}

export default function GeneralSettings() {
  const [platformStats, setPlatformStats] = useState<PlatformStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastStatsUpdate, setLastStatsUpdate] = useState<Date | null>(null);

  const [settings, setSettings] = useState<GeneralSettingsData>({
    platform: {
      siteName: 'Zinga Linga Educational Platform',
      siteDescription: 'Safe, fun, and educational videos for children aged 3-12 years.',
      contactEmail: 'hello@zingalinga.com',
      supportEmail: 'support@zingalinga.com',
      defaultLanguage: 'en',
      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    },
    features: {
      userRegistration: true,
      emailVerification: true,
      videoComments: true,
      videoDownloads: true,
      socialSharing: false,
      parentalControls: true,
      offlineMode: true,
      multiLanguage: true
    },
    limits: {
      maxVideoSize: 750,
      maxUsersPerAccount: 8,
      sessionTimeout: 45,
      maxChildrenPerAccount: 6,
      dailyVideoLimit: 25,
      maxDownloadsPerDay: 15
    },
    security: {
      requireEmailVerification: true,
      enableTwoFactor: true,
      passwordMinLength: 8,
      sessionSecurity: true,
      ipWhitelist: false,
      maintenanceMode: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: true,
      marketingEmails: false,
      systemAlerts: true
    },
    content: {
      autoModeration: true,
      contentFiltering: true,
      ageVerification: true,
      allowedVideoFormats: ['mp4', 'mov', 'avi', 'webm'],
      maxVideoLength: 45,
      thumbnailGeneration: true
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();

  // Load platform statistics on component mount
  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async (forceRefresh = false) => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const stats = await platformStatsCalculator.getPlatformStatistics(forceRefresh);
      setPlatformStats(stats);
      setLastStatsUpdate(new Date());
    } catch (error) {
      console.error('Error loading platform statistics:', error);
      setStatsError('Failed to load platform statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefreshStats = () => {
    loadPlatformStats(true);
  };

  const updateSettings = (section: keyof GeneralSettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('zingalinga_admin_settings', JSON.stringify(settings));
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      platform: {
        siteName: 'Zinga Linga',
        siteDescription: 'Educational videos for children aged 3-12',
        contactEmail: 'contact@zingalinga.com',
        supportEmail: 'support@zingalinga.com',
        defaultLanguage: 'en',
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY'
      },
      features: {
        userRegistration: true,
        emailVerification: true,
        videoComments: true,
        videoDownloads: true,
        socialSharing: false,
        parentalControls: true,
        offlineMode: true,
        multiLanguage: false
      },
      limits: {
        maxVideoSize: 500,
        maxUsersPerAccount: 5,
        sessionTimeout: 30,
        maxChildrenPerAccount: 5,
        dailyVideoLimit: 50,
        maxDownloadsPerDay: 10
      },
      security: {
        requireEmailVerification: true,
        enableTwoFactor: false,
        passwordMinLength: 8,
        sessionSecurity: true,
        ipWhitelist: false,
        maintenanceMode: false
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        systemAlerts: true
      },
      content: {
        autoModeration: true,
        contentFiltering: true,
        ageVerification: true,
        allowedVideoFormats: ['mp4', 'mov', 'avi'],
        maxVideoLength: 30,
        thumbnailGeneration: true
      }
    });
    setHasChanges(true);
    onResetClose();
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Professional Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">General Settings</h1>
            <p className="text-gray-600">Configure platform settings, features, and system preferences</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="flat"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              startContent={<RotateCcw className="h-4 w-4" />}
              onPress={onResetOpen}
            >
              Reset to Defaults
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              startContent={<Save className="h-4 w-4" />}
              onPress={handleSave}
              isLoading={saving}
              isDisabled={!hasChanges}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {hasChanges && (
        <Card className="border-l-4 border-l-orange-500">
          <CardBody className="py-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          </CardBody>
        </Card>
      )}

      {lastSaved && !hasChanges && (
        <Card className="border-l-4 border-l-green-500">
          <CardBody className="py-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Settings saved successfully at {lastSaved.toLocaleTimeString()}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Platform Statistics */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Platform Statistics</h3>
                <p className="text-sm text-gray-600">Real-time platform metrics and performance data</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {lastStatsUpdate && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Updated: {lastStatsUpdate.toLocaleTimeString()}
                </span>
              )}
              <Button
                size="sm"
                variant="flat"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                startContent={<RefreshCw className="h-3 w-3" />}
                onPress={handleRefreshStats}
                isLoading={statsLoading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {statsError && (
            <Card className="border-l-4 border-l-red-500 mb-4">
              <CardBody className="py-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{statsError}</span>
                </div>
              </CardBody>
            </Card>
          )}
          
          {statsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
              <span className="ml-2">Loading platform statistics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {platformStats?.totalUsers.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {platformStats?.activeVideos.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Active Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${platformStats?.monthlyRevenue.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {platformStats?.uptime.toFixed(1) || '0.0'}%
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          )}
          
          {platformStats && !statsLoading && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">
                    {platformStats.totalPurchases.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Purchases</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">
                    {platformStats.averageRating.toFixed(1)}★
                  </div>
                  <div className="text-xs text-gray-500">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">
                    {platformStats.totalWatchTime.toLocaleString()}h
                  </div>
                  <div className="text-xs text-gray-500">Watch Time</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">
                    {platformStats.newUsersThisMonth.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">New This Month</div>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Configuration */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
                <p className="text-sm text-gray-600">Basic platform settings and information</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Site Name"
              value={settings.platform.siteName}
              onChange={(e) => updateSettings('platform', 'siteName', e.target.value)}
              placeholder="Enter site name"
            />
            <Textarea
              label="Site Description"
              value={settings.platform.siteDescription}
              onChange={(e) => updateSettings('platform', 'siteDescription', e.target.value)}
              placeholder="Brief description of your platform"
              minRows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                type="email"
                value={settings.platform.contactEmail}
                onChange={(e) => updateSettings('platform', 'contactEmail', e.target.value)}
                placeholder="contact@example.com"
              />
              <Input
                label="Support Email"
                type="email"
                value={settings.platform.supportEmail}
                onChange={(e) => updateSettings('platform', 'supportEmail', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Default Language"
                selectedKeys={[settings.platform.defaultLanguage]}
                onSelectionChange={(keys) => updateSettings('platform', 'defaultLanguage', Array.from(keys)[0])}
              >
                <SelectItem key="en">English</SelectItem>
                <SelectItem key="es">Spanish</SelectItem>
                <SelectItem key="fr">French</SelectItem>
                <SelectItem key="de">German</SelectItem>
                <SelectItem key="it">Italian</SelectItem>
              </Select>
              <Select
                label="Timezone"
                selectedKeys={[settings.platform.timezone]}
                onSelectionChange={(keys) => updateSettings('platform', 'timezone', Array.from(keys)[0])}
              >
                <SelectItem key="UTC">UTC</SelectItem>
                <SelectItem key="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem key="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem key="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem key="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem key="Europe/London">London (GMT)</SelectItem>
                <SelectItem key="Europe/Paris">Paris (CET)</SelectItem>
                <SelectItem key="Asia/Tokyo">Tokyo (JST)</SelectItem>
                <SelectItem key="Australia/Sydney">Sydney (AEST)</SelectItem>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Currency"
                selectedKeys={[settings.platform.currency]}
                onSelectionChange={(keys) => updateSettings('platform', 'currency', Array.from(keys)[0])}
              >
                <SelectItem key="USD">USD ($) - US Dollar</SelectItem>
                <SelectItem key="EUR">EUR (€) - Euro</SelectItem>
                <SelectItem key="GBP">GBP (£) - British Pound</SelectItem>
                <SelectItem key="CAD">CAD (C$) - Canadian Dollar</SelectItem>
                <SelectItem key="AUD">AUD (A$) - Australian Dollar</SelectItem>
                <SelectItem key="JPY">JPY (¥) - Japanese Yen</SelectItem>
                <SelectItem key="CHF">CHF - Swiss Franc</SelectItem>
                <SelectItem key="SEK">SEK - Swedish Krona</SelectItem>
              </Select>
              <Select
                label="Date Format"
                selectedKeys={[settings.platform.dateFormat]}
                onSelectionChange={(keys) => updateSettings('platform', 'dateFormat', Array.from(keys)[0])}
              >
                <SelectItem key="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem key="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem key="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem key="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Feature Toggles */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Feature Controls</h3>
                <p className="text-sm text-gray-600">Enable or disable platform features</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Registration</p>
                <p className="text-sm text-gray-500">Allow new users to create accounts</p>
              </div>
              <Switch
                isSelected={settings.features.userRegistration}
                onValueChange={(value) => updateSettings('features', 'userRegistration', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-gray-500">Require email verification for new accounts</p>
              </div>
              <Switch
                isSelected={settings.features.emailVerification}
                onValueChange={(value) => updateSettings('features', 'emailVerification', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Video Comments</p>
                <p className="text-sm text-gray-500">Allow users to comment on videos</p>
              </div>
              <Switch
                isSelected={settings.features.videoComments}
                onValueChange={(value) => updateSettings('features', 'videoComments', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Video Downloads</p>
                <p className="text-sm text-gray-500">Allow users to download videos for offline viewing</p>
              </div>
              <Switch
                isSelected={settings.features.videoDownloads}
                onValueChange={(value) => updateSettings('features', 'videoDownloads', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Social Sharing</p>
                <p className="text-sm text-gray-500">Enable social media sharing buttons</p>
              </div>
              <Switch
                isSelected={settings.features.socialSharing}
                onValueChange={(value) => updateSettings('features', 'socialSharing', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Parental Controls</p>
                <p className="text-sm text-gray-500">Enable parental control features</p>
              </div>
              <Switch
                isSelected={settings.features.parentalControls}
                onValueChange={(value) => updateSettings('features', 'parentalControls', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Offline Mode</p>
                <p className="text-sm text-gray-500">Allow offline video viewing</p>
              </div>
              <Switch
                isSelected={settings.features.offlineMode}
                onValueChange={(value) => updateSettings('features', 'offlineMode', value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* System Limits */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Limits</h3>
                <p className="text-sm text-gray-600">Configure system resource limits and quotas</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max Video Size (MB)</label>
              <Input
                type="number"
                value={settings.limits.maxVideoSize.toString()}
                onChange={(e) => updateSettings('limits', 'maxVideoSize', parseInt(e.target.value) || 0)}
                min="1"
                max="2000"
                endContent={<span className="text-gray-500">MB</span>}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Users Per Account</label>
              <Input
                type="number"
                value={settings.limits.maxUsersPerAccount.toString()}
                onChange={(e) => updateSettings('limits', 'maxUsersPerAccount', parseInt(e.target.value) || 0)}
                min="1"
                max="20"
                endContent={<span className="text-gray-500">users</span>}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
              <Input
                type="number"
                value={settings.limits.sessionTimeout.toString()}
                onChange={(e) => updateSettings('limits', 'sessionTimeout', parseInt(e.target.value) || 0)}
                min="5"
                max="480"
                endContent={<span className="text-gray-500">min</span>}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Children Per Account</label>
              <Input
                type="number"
                value={settings.limits.maxChildrenPerAccount.toString()}
                onChange={(e) => updateSettings('limits', 'maxChildrenPerAccount', parseInt(e.target.value) || 0)}
                min="1"
                max="10"
                endContent={<span className="text-gray-500">children</span>}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Daily Video Limit</label>
              <Input
                type="number"
                value={settings.limits.dailyVideoLimit.toString()}
                onChange={(e) => updateSettings('limits', 'dailyVideoLimit', parseInt(e.target.value) || 0)}
                min="1"
                max="200"
                endContent={<span className="text-gray-500">videos</span>}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Downloads Per Day</label>
              <Input
                type="number"
                value={settings.limits.maxDownloadsPerDay.toString()}
                onChange={(e) => updateSettings('limits', 'maxDownloadsPerDay', parseInt(e.target.value) || 0)}
                min="1"
                max="50"
                endContent={<span className="text-gray-500">downloads</span>}
              />
            </div>
          </CardBody>
        </Card>

        {/* Security & Privacy */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security & Privacy</h3>
                <p className="text-sm text-gray-600">Security settings and privacy controls</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Email Verification</p>
                <p className="text-sm text-gray-500">Users must verify email before accessing content</p>
              </div>
              <Switch
                isSelected={settings.security.requireEmailVerification}
                onValueChange={(value) => updateSettings('security', 'requireEmailVerification', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Enable 2FA for enhanced security</p>
              </div>
              <Switch
                isSelected={settings.security.enableTwoFactor}
                onValueChange={(value) => updateSettings('security', 'enableTwoFactor', value)}
              />
            </div>
            <Divider />
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
              <Input
                type="number"
                value={settings.security.passwordMinLength.toString()}
                onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value) || 8)}
                min="6"
                max="32"
                endContent={<span className="text-gray-500">characters</span>}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enhanced Session Security</p>
                <p className="text-sm text-gray-500">Additional security checks for user sessions</p>
              </div>
              <Switch
                isSelected={settings.security.sessionSecurity}
                onValueChange={(value) => updateSettings('security', 'sessionSecurity', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">IP Whitelist</p>
                <p className="text-sm text-gray-500">Restrict admin access to specific IP addresses</p>
              </div>
              <Switch
                isSelected={settings.security.ipWhitelist}
                onValueChange={(value) => updateSettings('security', 'ipWhitelist', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-gray-500">Temporarily disable public access</p>
              </div>
              <Switch
                isSelected={settings.security.maintenanceMode}
                onValueChange={(value) => updateSettings('security', 'maintenanceMode', value)}
                color={settings.security.maintenanceMode ? 'warning' : 'primary'}
              />
            </div>
            {settings.security.maintenanceMode && (
              <Card className="bg-orange-50 border-orange-200">
                <CardBody className="py-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-700">
                      Maintenance mode is enabled. Users cannot access the platform.
                    </span>
                  </div>
                </CardBody>
              </Card>
            )}
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                <p className="text-sm text-gray-600">Configure notification preferences</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Send system notifications via email</p>
              </div>
              <Switch
                isSelected={settings.notifications.emailNotifications}
                onValueChange={(value) => updateSettings('notifications', 'emailNotifications', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">Browser and mobile push notifications</p>
              </div>
              <Switch
                isSelected={settings.notifications.pushNotifications}
                onValueChange={(value) => updateSettings('notifications', 'pushNotifications', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">Critical alerts via SMS</p>
              </div>
              <Switch
                isSelected={settings.notifications.smsNotifications}
                onValueChange={(value) => updateSettings('notifications', 'smsNotifications', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-500">Promotional and marketing communications</p>
              </div>
              <Switch
                isSelected={settings.notifications.marketingEmails}
                onValueChange={(value) => updateSettings('notifications', 'marketingEmails', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Alerts</p>
                <p className="text-sm text-gray-500">Critical system and security alerts</p>
              </div>
              <Switch
                isSelected={settings.notifications.systemAlerts}
                onValueChange={(value) => updateSettings('notifications', 'systemAlerts', value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Content Management */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Content Management</h3>
                <p className="text-sm text-gray-600">Content moderation and filtering settings</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Moderation</p>
                <p className="text-sm text-gray-500">Automatically moderate uploaded content</p>
              </div>
              <Switch
                isSelected={settings.content.autoModeration}
                onValueChange={(value) => updateSettings('content', 'autoModeration', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Content Filtering</p>
                <p className="text-sm text-gray-500">Filter inappropriate content automatically</p>
              </div>
              <Switch
                isSelected={settings.content.contentFiltering}
                onValueChange={(value) => updateSettings('content', 'contentFiltering', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Age Verification</p>
                <p className="text-sm text-gray-500">Require age verification for content access</p>
              </div>
              <Switch
                isSelected={settings.content.ageVerification}
                onValueChange={(value) => updateSettings('content', 'ageVerification', value)}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thumbnail Generation</p>
                <p className="text-sm text-gray-500">Auto-generate video thumbnails</p>
              </div>
              <Switch
                isSelected={settings.content.thumbnailGeneration}
                onValueChange={(value) => updateSettings('content', 'thumbnailGeneration', value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Video Length (minutes)</label>
              <Input
                type="number"
                value={settings.content.maxVideoLength.toString()}
                onChange={(e) => updateSettings('content', 'maxVideoLength', parseInt(e.target.value) || 0)}
                min="1"
                max="180"
                endContent={<span className="text-gray-500">min</span>}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Allowed Video Formats</label>
              <div className="flex flex-wrap gap-2">
                {settings.content.allowedVideoFormats.map((format) => (
                  <Chip key={format} size="sm" variant="flat" className="bg-indigo-100 text-indigo-800">
                    {format.toUpperCase()}
                  </Chip>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently supporting: {settings.content.allowedVideoFormats.join(', ')}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal isOpen={isResetOpen} onClose={onResetClose}>
        <ModalContent>
          <ModalHeader>Reset to Default Settings</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-medium">Are you sure you want to reset all settings?</p>
                  <p className="text-sm text-gray-500">This action cannot be undone. All current settings will be lost.</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Settings that will be reset:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Platform configuration</li>
                  <li>• Feature toggles</li>
                  <li>• System limits</li>
                  <li>• Security settings</li>
                  <li>• Notification preferences</li>
                  <li>• Content settings</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onResetClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleReset}>
              Reset Settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}