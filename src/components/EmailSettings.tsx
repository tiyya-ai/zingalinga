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
  Chip
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
  Save
} from 'lucide-react';

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
    enabled: false
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
        setConfig(JSON.parse(savedConfig));
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
      {/* Email Service Status */}
      <Card>
        <CardHeader className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Email Service Status</h3>
          <Chip 
            color={config.enabled ? "success" : "danger"} 
            variant="flat"
            size="sm"
          >
            {config.enabled ? "Enabled" : "Disabled"}
          </Chip>
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
      <Card>
        <CardHeader className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Email Provider Configuration</h3>
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
      <Card>
        <CardHeader className="flex items-center space-x-2">
          <Send className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Test Email Configuration</h3>
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

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button
          color="primary"
          size="lg"
          onPress={saveEmailConfig}
          isLoading={isSaving}
          startContent={<Save className="h-4 w-4" />}
        >
          Save Email Configuration
        </Button>
      </div>
    </div>
  );
}