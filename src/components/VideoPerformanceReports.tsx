'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
  Button
} from '@nextui-org/react';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { realDataAnalytics } from '../utils/realDataAnalytics';

interface VideoPerformanceReport {
    id: string;
    title: string;
    views: number;
    completionRate: number;
    revenue: number;
    trend: string;
    category: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

export default function VideoPerformanceReports() {
  const [videoPerformance, setVideoPerformance] = useState<VideoPerformanceReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        setLoading(true);
        const analytics = await realDataAnalytics.getVideoPerformance();
        setVideoPerformance(analytics);
      } catch (error) {
        console.error('Error loading video performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, []);

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <h1 className="text-3xl font-bold">Video Performance Reports</h1>
      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <Table
              classNames={{
                wrapper: "min-h-[222px]",
                th: "bg-gray-50 text-gray-700 font-semibold",
                td: "border-b border-gray-200",
                table: "border border-gray-200 rounded-lg"
              }}
            >
              <TableHeader>
                <TableColumn>VIDEO</TableColumn>
                <TableColumn>VIEWS</TableColumn>
                <TableColumn>COMPLETION</TableColumn>
                <TableColumn>REVENUE</TableColumn>
                <TableColumn>TREND</TableColumn>
              </TableHeader>
              <TableBody emptyContent={!loading && videoPerformance.length === 0 ? "No video performance data found" : "Loading..."}>
                {videoPerformance.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{video.title}</p>
                        <p className="text-sm text-gray-500">{video.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{video.views.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{video.completionRate}%</span>
                        <Progress
                          value={video.completionRate}
                          className="w-16"
                          size="sm"
                          color={video.completionRate > 80 ? 'success' : video.completionRate > 60 ? 'warning' : 'danger'}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(video.revenue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {video.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : video.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-4 w-4 bg-gray-400 rounded-full" />
                        )}
                        <Button
                          size="sm"
                          variant="light"
                          title="View Details"
                          onPress={() => alert(`Video Performance Details:\n\nTitle: ${video.title}\nViews: ${video.views.toLocaleString()}\nCompletion Rate: ${video.completionRate}%\nRevenue: ${formatCurrency(video.revenue)}\nTrend: ${video.trend}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}