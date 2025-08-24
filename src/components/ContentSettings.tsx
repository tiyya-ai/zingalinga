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
  Video,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ContentSettingsData {
  autoModeration: boolean;
  contentFiltering: boolean;
  ageVerification: boolean;
  thumbnailGeneration: boolean;
  maxVideoLength: number;
  allowedVideoFormats: string[];
}

export default function ContentSettings() {
  const [settings, setSettings] = useState<ContentSettingsData>({
    autoModeration: true,
    contentFiltering: true,
    ageVerification: true,
    thumbnailGeneration: true,
    maxVideoLength: 45,
    allowedVideoFormats: ['mp4', 'mov', 'avi', 'webm']
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('zingalinga_content_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load content settings:', error);
    }
  };

  const updateSetting = (key: keyof ContentSettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('zingalinga_content_settings', JSON.stringify(settings));
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving content settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Settings</h1>
          <p className="text-gray-600 mt-1">Configure content management and moderation settings</p>
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

      {/* Content Management */}
      <Card>
        <CardHeader className="flex items-center space-x-2">
          <Video className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-semibold">Content Management</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Moderation</p>
              <p className="text-sm text-gray-500">Automatically moderate uploaded content</p>
            </div>
            <Switch
              isSelected={settings.autoModeration}
              onValueChange={(value) => updateSetting('autoModeration', value)}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Content Filtering</p>
              <p className="text-sm text-gray-500">Filter inappropriate content automatically</p>
            </div>
            <Switch
              isSelected={settings.contentFiltering}
              onValueChange={(value) => updateSetting('contentFiltering', value)}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Age Verification</p>
              <p className="text-sm text-gray-500">Require age verification for content access</p>
            </div>
            <Switch
              isSelected={settings.ageVerification}
              onValueChange={(value) => updateSetting('ageVerification', value)}
            />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thumbnail Generation</p>
              <p className="text-sm text-gray-500">Auto-generate video thumbnails</p>
            </div>
            <Switch
              isSelected={settings.thumbnailGeneration}
              onValueChange={(value) => updateSetting('thumbnailGeneration', value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Video Length (minutes)</label>
            <Input
              type="number"
              value={settings.maxVideoLength.toString()}
              onChange={(e) => updateSetting('maxVideoLength', parseInt(e.target.value) || 0)}
              min="1"
              max="180"
              endContent={<span className="text-gray-500">min</span>}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Allowed Video Formats</label>
            <div className="flex flex-wrap gap-2">
              {settings.allowedVideoFormats.map((format) => (
                <Chip key={format} size="sm" variant="flat">
                  {format.toUpperCase()}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Currently supporting: {settings.allowedVideoFormats.join(', ')}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}