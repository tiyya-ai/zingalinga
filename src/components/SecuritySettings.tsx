'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Switch,
  Divider,
  Chip
} from '@nextui-org/react';
import {
  Shield,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SecuritySettingsData {
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  passwordMinLength: number;
  sessionSecurity: boolean;
  ipWhitelist: boolean;
  maintenanceMode: boolean;
}

export default function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettingsData>({
    requireEmailVerification: true,
    enableTwoFactor: true,
    passwordMinLength: 8,
    sessionSecurity: true,
    ipWhitelist: false,
    maintenanceMode: false
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('zingalinga_security_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  };

  const updateSetting = (key: keyof SecuritySettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('zingalinga_security_settings', JSON.stringify(settings));
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving security settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform security and access controls</p>
        </div>
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

      {/* Security Settings */}
      <Card>
        <CardHeader className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">Security Settings</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Email Verification</p>
              <p className="text-sm text-gray-500">Users must verify email before accessing content</p>
            </div>
            <Switch
              isSelected={settings.requireEmailVerification}
              onValueChange={(value) => updateSetting('requireEmailVerification', value)}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Enable 2FA for admin accounts</p>
            </div>
            <Switch
              isSelected={settings.enableTwoFactor}
              onValueChange={(value) => updateSetting('enableTwoFactor', value)}
            />
          </div>
          <Divider />
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
            <Input
              type="number"
              value={settings.passwordMinLength.toString()}
              onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value) || 6)}
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
              isSelected={settings.sessionSecurity}
              onValueChange={(value) => updateSetting('sessionSecurity', value)}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">IP Whitelist</p>
              <p className="text-sm text-gray-500">Restrict admin access to specific IP addresses</p>
            </div>
            <Switch
              isSelected={settings.ipWhitelist}
              onValueChange={(value) => updateSetting('ipWhitelist', value)}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Temporarily disable public access</p>
            </div>
            <Switch
              isSelected={settings.maintenanceMode}
              onValueChange={(value) => updateSetting('maintenanceMode', value)}
              color={settings.maintenanceMode ? 'warning' : 'primary'}
            />
          </div>
          {settings.maintenanceMode && (
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
    </div>
  );
}