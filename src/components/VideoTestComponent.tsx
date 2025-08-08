'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Chip } from '@nextui-org/react';
import { Play, ShoppingCart, CheckCircle } from 'lucide-react';
import { User, Module, Purchase } from '../types';
import { purchaseManager } from '../utils/purchaseManager';
import { checkVideoAccessSync, isValidVideoUrl } from '../utils/videoAccess';

interface VideoTestProps {
  user: User;
  module: Module;
}

export const VideoTestComponent: React.FC<VideoTestProps> = ({ user, module }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    loadUserPurchases();
  }, [user.id]);

  const loadUserPurchases = async () => {
    try {
      const userPurchases = await purchaseManager.getUserPurchases(user.id);
      setPurchases(userPurchases);
      addTestResult(`✅ Loaded ${userPurchases.length} purchases for user`);
    } catch (error) {
      addTestResult(`❌ Failed to load purchases: ${error}`);
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPurchase = async () => {
    setIsLoading(true);
    addTestResult(`🛒 Testing purchase for module: ${module.title}`);
    
    try {
      const success = await purchaseManager.purchaseVideo(user.id, module.id, module.price || 0);
      
      if (success) {
        addTestResult(`✅ Purchase successful!`);
        // Reload purchases to verify persistence
        await loadUserPurchases();
      } else {
        addTestResult(`❌ Purchase failed`);
      }
    } catch (error) {
      addTestResult(`❌ Purchase error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testVideoAccess = () => {
    const accessResult = checkVideoAccessSync(user, module, purchases);
    addTestResult(`🔍 Access check: ${accessResult.hasAccess ? '✅ GRANTED' : '❌ DENIED'} - ${accessResult.reason}`);
    return accessResult;
  };

  const testVideoUrl = () => {
    const urls = [module.videoUrl, (module as any).videoSource, (module as any).demoVideo].filter(Boolean);
    urls.forEach(url => {
      const isValid = isValidVideoUrl(url);
      addTestResult(`🎥 URL "${url?.substring(0, 50)}...": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    });
  };

  const clearTests = () => {
    setTestResults([]);
  };

  const accessResult = checkVideoAccessSync(user, module, purchases);
  const hasPurchased = purchases.some(p => p.moduleId === module.id && p.status === 'completed');

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl">
      <CardBody className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Video Test: {module.title}</h3>
            <div className="flex gap-2">
              {hasPurchased && (
                <Chip color="success" startContent={<CheckCircle className="w-4 h-4" />}>
                  Purchased
                </Chip>
              )}
              <Chip color={accessResult.hasAccess ? 'success' : 'danger'}>
                {accessResult.hasAccess ? 'Access Granted' : 'Access Denied'}
              </Chip>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Test Actions</h4>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  color="primary"
                  onClick={testVideoAccess}
                  startContent={<Play className="w-4 h-4" />}
                >
                  Test Access
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={testVideoUrl}
                >
                  Test Video URLs
                </Button>
                {!hasPurchased && (
                  <Button
                    size="sm"
                    color="success"
                    onClick={testPurchase}
                    isLoading={isLoading}
                    startContent={<ShoppingCart className="w-4 h-4" />}
                  >
                    Test Purchase (${module.price || 0})
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearTests}
                >
                  Clear Results
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white">Module Info</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Price: ${module.price || 0}</div>
                <div>Category: {module.category}</div>
                <div>Video URL: {module.videoUrl ? '✅' : '❌'}</div>
                <div>Demo URL: {module.demoVideo ? '✅' : '❌'}</div>
                <div>Purchases: {purchases.length}</div>
              </div>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Test Results</h4>
              <div className="bg-black/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm text-gray-300 font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};