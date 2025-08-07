import React, { useState } from 'react';
import { imageUtils } from '../utils/imageUtils';

export const ImageTestComponent: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [testFile, setTestFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleUrlTest = () => {
    const isValid = imageUtils.isValidImageUrl(testUrl);
    alert(`URL "${testUrl}" is ${isValid ? 'valid' : 'invalid'}`);
  };

  const handleFileTest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = imageUtils.validateImageFile(file);
      if (validation.valid) {
        setTestFile(file);
        const url = imageUtils.createPreviewUrl(file);
        setPreviewUrl(url);
      } else {
        alert(validation.error);
        e.target.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border border-purple-100">
      <h3 className="text-lg font-semibold mb-4">🖼️ Image Test Component</h3>
      
      <div className="space-y-4">
        {/* URL Test */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Image URL:
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={handleUrlTest}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Test URL
            </button>
          </div>
          {testUrl && (
            <div className="mt-2">
              <img
                src={testUrl}
                alt="URL Test"
                className="w-32 h-24 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.src = imageUtils.getFallbackImage();
                }}
              />
            </div>
          )}
        </div>

        {/* File Test */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Image File:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileTest}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="File Preview"
                className="w-32 h-24 object-cover rounded border"
              />
            </div>
          )}
        </div>

        {/* Fallback Test */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fallback Image:
          </label>
          <img
            src={imageUtils.getFallbackImage()}
            alt="Fallback"
            className="w-32 h-24 object-cover rounded border"
          />
        </div>
      </div>
    </div>
  );
};