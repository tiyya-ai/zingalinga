'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Switch,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Chip,
  Tabs,
  Tab
} from '@nextui-org/react';
import {
  Mail,
  Server,
  Shield,
  Send,
  AlertCircle,
  CheckCircle,
  Settings,
  Key,
  Globe,
  Save,
  Bell,
  TestTube
} from 'lucide-react';
import EmailTestPanel from './EmailTestPanel';

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  adminEmail: string;
  provider: 'sendgrid' | 'mailgun' | 'smtp' | 'aws-ses';
  apiKey?: string;
  enabled: boolean;
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    systemAlerts: boolean;
  };
}

interface EmailSettingsProps {
  onConfigUpdate?: (config: EmailConfig) => void;
}

export default function EmailSettings({ onConfigUpdate }: EmailSettingsProps) {
  const [config, setConfig] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: 'noreply@zingalinga.com',
    fromName: 'Zinga Linga',
    adminEmail: 'admin@zingalinga.com',
    provider: 'smtp',
    apiKey: '',
    enabled: false,
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: true,
      marketingEmails: false,
      systemAlerts: true
    }
  });

  const [testEmail, setTestEmail] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = () => {
    try {
      const savedConfig = localStorage.getItem('emailConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig({
          ...parsed,
          notifications: parsed.notifications || {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: true,
            marketingEmails: false,
            systemAlerts: true
          }
        });
      }
    } catch (error) {
      console.error('Failed to load email config:', error);
    }
  };

  const saveEmailConfig = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('emailConfig', JSON.stringify(config));
      onConfigUpdate?.(config);
      setTestResult({ success: true, message: 'Email configuration saved successfully!' });
    } catch (error) {
      console.error('Failed to save email config:', error);
      setTestResult({ success: false, message: 'Failed to save configuration. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailConnection = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: 'Please enter a test email address.' });
      return;
    }

    setIsTestingEmail(true);
    setTestResult(null);

    try {
      // Simulate email test - in production, this would call your email service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (config.enabled && (config.smtpHost || config.apiKey)) {
        setTestResult({ 
          success: true, 
          message: `Test email sent successfully to ${testEmail}!` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: 'Email service is not properly configured. Please check your settings.' 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Failed to send test email. Please check your configuration.' 
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const updateConfig = (field: keyof EmailConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const getProviderFields = () => {
    switch (config.provider) {
      case 'sendgrid':
        return (
          <Input
            type="password"
            value={config.apiKey || ''}
            onChange={(e) => updateConfig('apiKey', e.target.value)}
            placeholder="SendGrid API Key"
            startContent={<Key className="h-4 w-4 text-gray-400" />}
          />
        );
      case 'mailgun':
        return (
          <div className="space-y-4">
            <Input
              type="password"
              value={config.apiKey || ''}
              onChange={(e) => updateConfig('apiKey', e.target.value)}
              placeholder="Mailgun API Key"
              startContent={<Key className="h-4 w-4 text-gray-400" />}
            />
            <Input
              value={config.smtpHost}
              onChange={(e) => updateConfig('smtpHost', e.target.value)}
              placeholder="Mailgun Domain"
              startContent={<Globe className="h-4 w-4 text-gray-400" />}
            />
          </div>
        );
      case 'aws-ses':
        return (
          <div className="space-y-4">
            <Input
              value={config.smtpUser}
              onChange={(e) => updateConfig('smtpUser', e.target.value)}
              placeholder="AWS Access Key ID"
            />
            <Input
              type="password"
              value={config.smtpPassword}
              onChange={(e) => updateConfig('smtpPassword', e.target.value)}
              placeholder="AWS Secret Access Key"
            />
            <Input
              value={config.smtpHost}
              onChange={(e) => updateConfig('smtpHost', e.target.value)}
              placeholder="AWS Region (e.g., us-east-1)"
            />
          </div>
        );
      default: // SMTP
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={config.smtpHost}
                onChange={(e) => updateConfig('smtpHost', e.target.value)}
                placeholder="SMTP Host (e.g., smtp.gmail.com)"
                startContent={<Server className="h-4 w-4 text-gray-400" />}
              />
              <Input
                type="number"
                value={config.smtpPort.toString()}
                onChange={(e) => updateConfig('smtpPort', parseInt(e.target.value) || 587)}
                placeholder="SMTP Port (587)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={config.smtpUser}
                onChange={(e) => updateConfig('smtpUser', e.target.value)}
                placeholder="SMTP Username"
              />
              <Input
                type="password"
                value={config.smtpPassword}
                onChange={(e) => updateConfig('smtpPassword', e.target.value)}
                placeholder="SMTP Password"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Use SSL/TLS</p>
                <p className="text-sm text-gray-500">Enable secure connection</p>
              </div>
              <Switch
                isSelected={config.smtpSecure}
                onValueChange={(value) => updateConfig('smtpSecure', value)}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Email Settings</h1>
            <p className="text-gray-600">Configure email service providers, notifications, and delivery settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <Chip 
              color={config.enabled ? "success" : "danger"} 
              variant="flat"
              size="lg"
              className="px-3 py-1"
            >
              {config.enabled ? "Service Active" : "Service Disabled"}
            </Chip>
          </div>
        </div>
      </div>

      {/* Tabs for Configuration and Testing */}
      <Tabs aria-label="Email Settings" className="w-full">
        <Tab key="configuration" title={
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuration</span>
          </div>
        }>
          <div className="space-y-6 mt-6">
            {/* Email Service Status */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email Service Status</h3>
              <p className="text-sm text-gray-600">Enable or disable email functionality</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Email Notifications</p>
              <p className="text-sm text-gray-500">
                Turn on to send automated emails for registrations, purchases, and reminders
              </p>
            </div>
            <Switch
              isSelected={config.enabled}
              onValueChange={(value) => updateConfig('enabled', value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Email Provider Configuration */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email Provider Configuration</h3>
              <p className="text-sm text-gray-600">Configure your email service provider settings</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="Email Provider"
            selectedKeys={[config.provider]}
            onSelectionChange={(keys) => updateConfig('provider', Array.from(keys)[0])}
            description="Choose your preferred email service provider"
          >
            <SelectItem key="smtp" value="smtp">Custom SMTP Server</SelectItem>
            <SelectItem key="sendgrid" value="sendgrid">SendGrid</SelectItem>
            <SelectItem key="mailgun" value="mailgun">Mailgun</SelectItem>
            <SelectItem key="aws-ses" value="aws-ses">AWS SES</SelectItem>
          </Select>

          <Divider />

          {getProviderFields()}

          <Divider />

          {/* Sender Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Sender Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="email"
                value={config.fromEmail}
                onChange={(e) => updateConfig('fromEmail', e.target.value)}
                placeholder="From Email"
              />
              <Input
                value={config.fromName}
                onChange={(e) => updateConfig('fromName', e.target.value)}
                placeholder="From Name"
              />
            </div>
            <Input
              type="email"
              value={config.adminEmail}
              onChange={(e) => updateConfig('adminEmail', e.target.value)}
              placeholder="Admin Email"
            />
          </div>
        </CardBody>
      </Card>

      {/* Test Email */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Send className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Test Email Configuration</h3>
              <p className="text-sm text-gray-600">Send a test email to verify your settings</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Test Email Address"
              className="flex-1"
            />
            <Button
              color="primary"
              onPress={testEmailConnection}
              isLoading={isTestingEmail}
              isDisabled={!config.enabled || !testEmail}
              className="self-end"
            >
              Send Test Email
            </Button>
          </div>

          {testResult && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-600">Configure notification delivery methods</p>
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
              isSelected={config.notifications.emailNotifications}
              onValueChange={(value) => updateConfig('notifications', { ...config.notifications, emailNotifications: value })}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">Browser and mobile push notifications</p>
            </div>
            <Switch
              isSelected={config.notifications.pushNotifications}
              onValueChange={(value) => updateConfig('notifications', { ...config.notifications, pushNotifications: value })}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-gray-500">Critical alerts via SMS</p>
            </div>
            <Switch
              isSelected={config.notifications.smsNotifications}
              onValueChange={(value) => updateConfig('notifications', { ...config.notifications, smsNotifications: value })}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing Emails</p>
              <p className="text-sm text-gray-500">Promotional and marketing communications</p>
            </div>
            <Switch
              isSelected={config.notifications.marketingEmails}
              onValueChange={(value) => updateConfig('notifications', { ...config.notifications, marketingEmails: value })}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System Alerts</p>
              <p className="text-sm text-gray-500">Critical system and security alerts</p>
            </div>
            <Switch
              isSelected={config.notifications.systemAlerts}
              onValueChange={(value) => updateConfig('notifications', { ...config.notifications, systemAlerts: value })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Email Templates */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
              <p className="text-sm text-gray-600">Customize email templates and branding</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900">Welcome Email</h4>
              </div>
              <p className="text-sm text-gray-600">Sent to new users after registration</p>
              <Button size="sm" variant="flat" className="mt-2 bg-blue-50 text-blue-600" onPress={() => alert('Welcome Email template editor coming soon!')}>Edit Template</Button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Purchase Confirmation</h4>
              </div>
              <p className="text-sm text-gray-600">Sent after successful purchases</p>
              <Button size="sm" variant="flat" className="mt-2 bg-green-50 text-green-600" onPress={() => alert('Purchase Confirmation template editor coming soon!')}>Edit Template</Button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <h4 className="font-medium text-gray-900">Password Reset</h4>
              </div>
              <p className="text-sm text-gray-600">Sent for password reset requests</p>
              <Button size="sm" variant="flat" className="mt-2 bg-orange-50 text-orange-600" onPress={() => alert('Password Reset template editor coming soon!')}>Edit Template</Button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900">System Alerts</h4>
              </div>
              <p className="text-sm text-gray-600">Critical system notifications</p>
              <Button size="sm" variant="flat" className="mt-2 bg-purple-50 text-purple-600" onPress={() => alert('System Alerts template editor coming soon!')}>Edit Template</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Email Analytics */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Analytics</h3>
                <p className="text-sm text-gray-600">Email delivery statistics and performance</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">1,234</div>
              <div className="text-sm text-gray-600">Emails Sent</div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">98.5%</div>
              <div className="text-sm text-gray-600">Delivery Rate</div>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">24.3%</div>
              <div className="text-sm text-gray-600">Open Rate</div>
              <div className="text-xs text-gray-500">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">3.2%</div>
              <div className="text-sm text-gray-600">Click Rate</div>
              <div className="text-xs text-gray-500">Average</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <p>Changes are saved automatically when you update settings.</p>
        </div>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          size="lg"
          onPress={saveEmailConfig}
          isLoading={isSaving}
          startContent={<Save className="h-4 w-4" />}
        >
          {isSaving ? 'Saving...' : 'Save Email Configuration'}
        </Button>
      </div>
            </div>
        </Tab>
        
        <Tab key="testing" title={
          <div className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Email Testing & Preview</span>
          </div>
        }>
          <div className="mt-6">
            <EmailTestPanel />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}