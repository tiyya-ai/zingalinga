'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/react';
import {
  Activity,
  Database,
  Clock,
  Zap,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useDataPerformance } from '../hooks/useOptimizedData';

export default function PerformanceMonitor() {
  const { stats, clearCache, preloadData } = useDataPerformance();
  const [isVisible, setIsVisible] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!isVisible) {
    return (
      <Button
        size="sm"
        variant="flat"
        className="fixed bottom-4 right-4 z-50"
        startContent={<Activity className="h-4 w-4" />}
        onPress={() => setIsVisible(true)}
      >
        Performance
      </Button>
    );
  }

  const getCacheHealthColor = () => {
    if (!stats) return 'default';
    if (stats.cacheSize > 10) return 'danger';
    if (stats.cacheSize > 5) return 'warning';
    return 'success';
  };

  const getLoadingHealthColor = () => {
    if (!stats) return 'default';
    if (stats.loadingPromises > 3) return 'danger';
    if (stats.loadingPromises > 1) return 'warning';
    return 'success';
  };

  return (
    <>
      <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold">Performance Monitor</h4>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={onOpen}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={() => setIsVisible(false)}
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          {stats ? (
            <>
              {/* Cache Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-3 w-3 text-gray-500" />
                  <span className="text-xs">Cache Size</span>
                </div>
                <Chip size="sm" color={getCacheHealthColor()}>
                  {stats.cacheSize}
                </Chip>
              </div>

              {/* Active Loading */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-xs">Loading</span>
                </div>
                <Chip size="sm" color={getLoadingHealthColor()}>
                  {stats.loadingPromises}
                </Chip>
              </div>

              {/* Subscribers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 w-3 text-gray-500" />
                  <span className="text-xs">Subscribers</span>
                </div>
                <Chip size="sm" color="primary">
                  {stats.subscriberCount}
                </Chip>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<RefreshCw className="h-3 w-3" />}
                  onPress={() => preloadData()}
                  className="flex-1"
                >
                  Preload
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  startContent={<Trash2 className="h-3 w-3" />}
                  onPress={() => clearCache()}
                  className="flex-1"
                >
                  Clear Cache
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-gray-500">
              Loading performance data...
            </div>
          )}
        </CardBody>
      </Card>

      {/* Detailed Stats Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Performance Details</ModalHeader>
          <ModalBody>
            {stats ? (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Cache Overview</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium">Cache Size</div>
                      <div className="text-lg">{stats.cacheSize}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium">Active Loads</div>
                      <div className="text-lg">{stats.loadingPromises}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Cached Data Types</h5>
                  <div className="flex flex-wrap gap-2">
                    {stats.cachedKeys.map((key: string) => (
                      <Chip key={key} size="sm" variant="flat">
                        {key.replace('data_', '')}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Performance Tips</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Cache size under 5 is optimal</li>
                    <li>• Multiple loading promises indicate redundant requests</li>
                    <li>• Use preload for critical data</li>
                    <li>• Clear cache if memory usage is high</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-3 rounded">
                  <h6 className="font-medium text-blue-800">Current Status</h6>
                  <p className="text-sm text-blue-600">
                    {stats.cacheSize === 0 && 'No cached data - first loads may be slower'}
                    {stats.cacheSize > 0 && stats.cacheSize <= 5 && 'Optimal cache size - good performance'}
                    {stats.cacheSize > 5 && stats.cacheSize <= 10 && 'High cache usage - consider clearing'}
                    {stats.cacheSize > 10 && 'Very high cache usage - clear cache recommended'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading performance data...</div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" onPress={() => preloadData()}>
              Optimize Performance
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}