'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Spinner
} from '@nextui-org/react';
import {
  Settings,
  Globe,
  Shield,
  Video,
  Save,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { platformStatsCalculator, PlatformStatistics } from '../utils/platformStats';

interface GeneralSettingsData {
  platform: {
    siteName: string;
    contactEmail: string;
    defaultLanguage: string;
    currency: string;
  };
  features: {
    userRegistration: boolean;
    emailVerification: boolean;
    parentalControls: boolean;
  };
  security: {
    enableTwoFactor: boolean;
    sessionSecurity: boolean;
    maintenanceMode: boolean;
  };
  content: {
    autoModeration: boolean;
    contentFiltering: boolean;
    ageVerification: boolean;
  };
}

export default function GeneralSettings() {
  const [platformStats, setPlatformStats] = useState<PlatformStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [settings, setSettings] = useState<GeneralSettingsData>({
    platform: {
      siteName: 'Zinga Linga Educational Platform',
      contactEmail: 'hello@zingalinga.com',
      defaultLanguage: 'en',
      currency: 'USD'
    },
    features: {
      userRegistration: true,
      emailVerification: true,
      parentalControls: true
    },
    security: {
      enableTwoFactor: true,
      sessionSecurity: true,
      maintenanceMode: false
    },
    content: {
      autoModeration: true,
      contentFiltering: true,
      ageVerification: true
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async (forceRefresh = false) => {
    try {
      setStatsLoading(true);
      const stats = await platformStatsCalculator.calculateStats(forceRefresh);
      setPlatformStats(stats);
    } catch (error) {
      console.error('Failed to load platform stats:', error);
    } finally {
      setStatsLoading(false);
    }
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quick Actions</h1>
          <p className="text-gray-600 mt-1">Essential platform controls and settings</p>
        </div>
        <div className="flex space-x-2">
          <Button
            color="primary"
            startContent={<Save className="h-4 w-4" />}
            onPress={handleSave}
            isLoading={saving}
            isDisabled={!hasChanges}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
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

      {/* Quick Stats Overview */}
      <Card>
        <CardHeader className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Platform Overview</h3>
        </CardHeader>
        <CardBody>
          {statsLoading && (
            <div className="flex justify-center items-center py-4">
              <Spinner size="md" />
            </div>
          )}
          
          {platformStats && !statsLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {platformStats?.totalUsers.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-600">Users</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {platformStats?.activeVideos.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-600">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  ${platformStats?.monthlyRevenue.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-600">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {platformStats?.uptime.toFixed(1) || '0.0'}%
                </div>
                <div className="text-xs text-gray-600">Uptime</div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Essential Features */}
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Essential Features</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">User Registration</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.features.userRegistration}
                onValueChange={(value) => updateSettings('features', 'userRegistration', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Email Verification</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.features.emailVerification}
                onValueChange={(value) => updateSettings('features', 'emailVerification', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Parental Controls</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.features.parentalControls}
                onValueChange={(value) => updateSettings('features', 'parentalControls', value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Security Controls */}
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Security</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Two-Factor Auth</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.security.enableTwoFactor}
                onValueChange={(value) => updateSettings('security', 'enableTwoFactor', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Session Security</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.security.sessionSecurity}
                onValueChange={(value) => updateSettings('security', 'sessionSecurity', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Maintenance Mode</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.security.maintenanceMode}
                onValueChange={(value) => updateSettings('security', 'maintenanceMode', value)}
                color={settings.security.maintenanceMode ? 'warning' : 'primary'}
              />
            </div>
            {settings.security.maintenanceMode && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                <p className="text-xs text-orange-700 font-medium">⚠️ Site is in maintenance mode</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Content Controls */}
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Content</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Auto Moderation</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.content.autoModeration}
                onValueChange={(value) => updateSettings('content', 'autoModeration', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Content Filtering</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.content.contentFiltering}
                onValueChange={(value) => updateSettings('content', 'contentFiltering', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Age Verification</p>
              </div>
              <Switch
                size="sm"
                isSelected={settings.content.ageVerification}
                onValueChange={(value) => updateSettings('content', 'ageVerification', value)}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Settings */}
      <Card>
        <CardHeader className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Quick Settings</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              size="sm"
              label="Site Name"
              value={settings.platform.siteName}
              onChange={(e) => updateSettings('platform', 'siteName', e.target.value)}
            />
            <Input
              size="sm"
              label="Contact Email"
              type="email"
              value={settings.platform.contactEmail}
              onChange={(e) => updateSettings('platform', 'contactEmail', e.target.value)}
            />
            <Select
              size="sm"
              label="Language"
              selectedKeys={[settings.platform.defaultLanguage]}
              onSelectionChange={(keys) => updateSettings('platform', 'defaultLanguage', Array.from(keys)[0])}
            >
              <SelectItem key="en">English</SelectItem>
              <SelectItem key="es">Spanish</SelectItem>
              <SelectItem key="fr">French</SelectItem>
            </Select>
            <Select
              size="sm"
              label="Currency"
              selectedKeys={[settings.platform.currency]}
              onSelectionChange={(keys) => updateSettings('platform', 'currency', Array.from(keys)[0])}
            >
              <SelectItem key="USD">USD ($)</SelectItem>
              <SelectItem key="EUR">EUR (€)</SelectItem>
              <SelectItem key="GBP">GBP (£)</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}