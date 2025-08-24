'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Switch,
  Divider,
  Chip,
  Input,
  Select,
  SelectItem,
  Textarea
} from '@nextui-org/react';
import {
  Bell,
  Save,
  AlertTriangle,
  CheckCircle,
  Mail,
  Smartphone,
  MessageSquare,
  Settings,
  Users,
  ShoppingCart,
  Shield,
  Activity
} from 'lucide-react';

interface NotificationSettings {
  email: {
    enabled: boolean;
    newUserRegistration: boolean;
    newPurchase: boolean;
    systemAlerts: boolean;
    securityAlerts: boolean;
    maintenanceNotices: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  push: {
    enabled: boolean;
    newUserRegistration: boolean;
    newPurchase: boolean;
    systemAlerts: boolean;
    securityAlerts: boolean;
    browserNotifications: boolean;
  };
  sms: {
    enabled: boolean;
    criticalAlerts: boolean;
    securityAlerts: boolean;
    systemDown: boolean;
    phoneNumber: string;
  };
  slack: {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
    newUserRegistration: boolean;
    newPurchase: boolean;
    systemAlerts: boolean;
  };
  discord: {
    enabled: boolean;
    webhookUrl: string;
    newUserRegistration: boolean;
    newPurchase: boolean;
    systemAlerts: boolean;
  };
  general: {
    quietHours: boolean;
    quietStart: string;
    quietEnd: string;
    timezone: string;
    batchNotifications: boolean;
    minimumInterval: number;
  };
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      newUserRegistration: true,
      newPurchase: true,
      systemAlerts: true,
      securityAlerts: true,
      maintenanceNotices: true,
      weeklyReports: true,
      monthlyReports: true,
    },
    push: {
      enabled: true,
      newUserRegistration: true,
      newPurchase: true,
      systemAlerts: true,
      securityAlerts: true,
      browserNotifications: true,
    },
    sms: {
      enabled: false,
      criticalAlerts: true,
      securityAlerts: true,
      systemDown: true,
      phoneNumber: '',
    },
    slack: {
      enabled: false,
      webhookUrl: '',
      channel: '#general',
      newUserRegistration: false,
      newPurchase: true,
      systemAlerts: true,
    },
    discord: {
      enabled: false,
      webhookUrl: '',
      newUserRegistration: false,
      newPurchase: true,
      systemAlerts: true,
    },
    general: {
      quietHours: false,
      quietStart: '22:00',
      quietEnd: '08:00',
      timezone: 'America/New_York',
      batchNotifications: true,
      minimumInterval: 5,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('zingalinga_notification_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const updateSetting = (section: keyof NotificationSettings, key: string, value: any) => {
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
      localStorage.setItem('zingalinga_notification_settings', JSON.stringify(settings));
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: string) => {
    // Simulate sending test notification
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Test ${type} notification sent successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Notification Settings</h1>
            <p className="text-gray-600">Configure how and when you receive notifications about platform activity</p>
          </div>
          <div className="flex space-x-3">
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
        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardBody className="py-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-700">You have unsaved changes</span>
            </div>
          </CardBody>
        </Card>
      )}

      {lastSaved && !hasChanges && (
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardBody className="py-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">Settings saved successfully at {lastSaved.toLocaleTimeString()}</span>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Notifications */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  isSelected={settings.email.enabled}
                  onValueChange={(value) => updateSetting('email', 'enabled', value)}
                />
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-blue-50 text-blue-600"
                  onPress={() => testNotification('email')}
                  isDisabled={!settings.email.enabled}
                >
                  Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New User Registration</p>
                <p className="text-sm text-gray-500">When new users sign up</p>
              </div>
              <Switch
                isSelected={settings.email.newUserRegistration}
                onValueChange={(value) => updateSetting('email', 'newUserRegistration', value)}
                isDisabled={!settings.email.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Purchase</p>
                <p className="text-sm text-gray-500">When users make purchases</p>
              </div>
              <Switch
                isSelected={settings.email.newPurchase}
                onValueChange={(value) => updateSetting('email', 'newPurchase', value)}
                isDisabled={!settings.email.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Alerts</p>
                <p className="text-sm text-gray-500">Important system notifications</p>
              </div>
              <Switch
                isSelected={settings.email.systemAlerts}
                onValueChange={(value) => updateSetting('email', 'systemAlerts', value)}
                isDisabled={!settings.email.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-gray-500">Security-related notifications</p>
              </div>
              <Switch
                isSelected={settings.email.securityAlerts}
                onValueChange={(value) => updateSetting('email', 'securityAlerts', value)}
                isDisabled={!settings.email.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-gray-500">Weekly platform summary</p>
              </div>
              <Switch
                isSelected={settings.email.weeklyReports}
                onValueChange={(value) => updateSetting('email', 'weeklyReports', value)}
                isDisabled={!settings.email.enabled}
              />
            </div>
          </CardBody>
        </Card>

        {/* Push Notifications */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Browser and mobile push notifications</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  isSelected={settings.push.enabled}
                  onValueChange={(value) => updateSetting('push', 'enabled', value)}
                />
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-green-50 text-green-600"
                  onPress={() => testNotification('push')}
                  isDisabled={!settings.push.enabled}
                >
                  Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New User Registration</p>
                <p className="text-sm text-gray-500">When new users sign up</p>
              </div>
              <Switch
                isSelected={settings.push.newUserRegistration}
                onValueChange={(value) => updateSetting('push', 'newUserRegistration', value)}
                isDisabled={!settings.push.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Purchase</p>
                <p className="text-sm text-gray-500">When users make purchases</p>
              </div>
              <Switch
                isSelected={settings.push.newPurchase}
                onValueChange={(value) => updateSetting('push', 'newPurchase', value)}
                isDisabled={!settings.push.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Alerts</p>
                <p className="text-sm text-gray-500">Important system notifications</p>
              </div>
              <Switch
                isSelected={settings.push.systemAlerts}
                onValueChange={(value) => updateSetting('push', 'systemAlerts', value)}
                isDisabled={!settings.push.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Browser Notifications</p>
                <p className="text-sm text-gray-500">Show notifications in browser</p>
              </div>
              <Switch
                isSelected={settings.push.browserNotifications}
                onValueChange={(value) => updateSetting('push', 'browserNotifications', value)}
                isDisabled={!settings.push.enabled}
              />
            </div>
          </CardBody>
        </Card>

        {/* SMS Notifications */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">Critical alerts via SMS</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  isSelected={settings.sms.enabled}
                  onValueChange={(value) => updateSetting('sms', 'enabled', value)}
                />
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-purple-50 text-purple-600"
                  onPress={() => testNotification('SMS')}
                  isDisabled={!settings.sms.enabled || !settings.sms.phoneNumber}
                >
                  Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                value={settings.sms.phoneNumber}
                onChange={(e) => updateSetting('sms', 'phoneNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
                isDisabled={!settings.sms.enabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Critical Alerts</p>
                <p className="text-sm text-gray-500">System failures and emergencies</p>
              </div>
              <Switch
                isSelected={settings.sms.criticalAlerts}
                onValueChange={(value) => updateSetting('sms', 'criticalAlerts', value)}
                isDisabled={!settings.sms.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-gray-500">Security breaches and suspicious activity</p>
              </div>
              <Switch
                isSelected={settings.sms.securityAlerts}
                onValueChange={(value) => updateSetting('sms', 'securityAlerts', value)}
                isDisabled={!settings.sms.enabled}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Down</p>
                <p className="text-sm text-gray-500">When the platform is unavailable</p>
              </div>
              <Switch
                isSelected={settings.sms.systemDown}
                onValueChange={(value) => updateSetting('sms', 'systemDown', value)}
                isDisabled={!settings.sms.enabled}
              />
            </div>
          </CardBody>
        </Card>

        {/* General Settings */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                <p className="text-sm text-gray-600">Global notification preferences</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Quiet Hours</p>
                <p className="text-sm text-gray-500">Disable notifications during specified hours</p>
              </div>
              <Switch
                isSelected={settings.general.quietHours}
                onValueChange={(value) => updateSetting('general', 'quietHours', value)}
              />
            </div>
            {settings.general.quietHours && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <Input
                      type="time"
                      value={settings.general.quietStart}
                      onChange={(e) => updateSetting('general', 'quietStart', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <Input
                      type="time"
                      value={settings.general.quietEnd}
                      onChange={(e) => updateSetting('general', 'quietEnd', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Batch Notifications</p>
                <p className="text-sm text-gray-500">Group similar notifications together</p>
              </div>
              <Switch
                isSelected={settings.general.batchNotifications}
                onValueChange={(value) => updateSetting('general', 'batchNotifications', value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Interval (minutes)</label>
              <Input
                type="number"
                value={settings.general.minimumInterval.toString()}
                onChange={(e) => updateSetting('general', 'minimumInterval', parseInt(e.target.value) || 5)}
                min="1"
                max="60"
                endContent={<span className="text-gray-500">min</span>}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Notification History */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
                <p className="text-sm text-gray-600">Last 10 notifications sent</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {[
              { type: 'email', message: 'New user registration: john@example.com', time: '2 minutes ago', status: 'delivered' },
              { type: 'push', message: 'System maintenance scheduled', time: '15 minutes ago', status: 'delivered' },
              { type: 'email', message: 'New purchase: Premium Package', time: '1 hour ago', status: 'delivered' },
              { type: 'sms', message: 'Security alert: Failed login attempts', time: '2 hours ago', status: 'failed' },
              { type: 'email', message: 'Weekly report generated', time: '1 day ago', status: 'delivered' },
            ].map((notification, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    notification.type === 'email' ? 'bg-blue-100' :
                    notification.type === 'push' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {notification.type === 'email' ? <Mail className="h-4 w-4 text-blue-600" /> :
                     notification.type === 'push' ? <Bell className="h-4 w-4 text-green-600" /> :
                     <Smartphone className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{notification.message}</p>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </div>
                </div>
                <Chip
                  size="sm"
                  color={notification.status === 'delivered' ? 'success' : 'danger'}
                  variant="flat"
                >
                  {notification.status}
                </Chip>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}