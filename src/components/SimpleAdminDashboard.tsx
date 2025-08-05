'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar
} from '@nextui-org/react';
import {
  Users,
  Video,
  Settings,
  LogOut,
  Eye,
  DollarSign,
  Menu,
  X,
  Home
} from 'lucide-react';

interface SimpleAdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function SimpleAdminDashboard({ user, onLogout }: SimpleAdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const sampleData = {
    users: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', totalSpent: 29.99, createdAt: new Date().toISOString() },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', totalSpent: 49.99, createdAt: new Date().toISOString() }
    ],
    transactions: [
      { id: '1', orderId: 'ORD-001', customer: { name: 'John Doe', email: 'john@example.com' }, item: 'Video Package', amount: 29.99, status: 'completed', date: new Date(), paymentMethod: 'Credit Card' },
      { id: '2', orderId: 'ORD-002', customer: { name: 'Jane Smith', email: 'jane@example.com' }, item: 'Premium Plan', amount: 49.99, status: 'completed', date: new Date(), paymentMethod: 'PayPal' }
    ],
    stats: {
      totalRevenue: 1250.00,
      totalUsers: 150,
      totalVideos: 25,
      monthlyRevenue: 450.00
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex flex-row items-center space-x-4 p-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(sampleData.stats.totalRevenue)}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center space-x-4 p-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{sampleData.stats.totalUsers}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center space-x-4 p-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold">{sampleData.stats.totalVideos}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center space-x-4 p-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(sampleData.stats.monthlyRevenue)}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Users</h1>
      <Card>
        <CardBody>
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>TOTAL SPENT</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {sampleData.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip color="primary" size="sm">{user.role}</Chip>
                  </TableCell>
                  <TableCell>{mounted ? new Date(user.createdAt).toLocaleDateString() : 'Loading...'}</TableCell>
                  <TableCell>{formatCurrency(user.totalSpent)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="light">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recent Transactions</h1>
      <Card>
        <CardBody>
          <Table aria-label="Transactions table">
            <TableHeader>
              <TableColumn>ORDER ID</TableColumn>
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>ITEM</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>DATE</TableColumn>
            </TableHeader>
            <TableBody>
              {sampleData.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.orderId}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar name={transaction.customer.name} size="sm" />
                      <div>
                        <p className="font-medium">{transaction.customer.name}</p>
                        <p className="text-sm text-gray-500">{transaction.customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.item}</TableCell>
                  <TableCell className="font-semibold text-green-600">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    <Chip color={getStatusColor(transaction.status)} size="sm">
                      {transaction.status}
                    </Chip>
                  </TableCell>
                  <TableCell>{mounted ? transaction.date.toLocaleDateString() : 'Loading...'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'transactions':
        return renderTransactions();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 shadow-lg transition-all duration-300 flex flex-col h-full`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
            )}
            <Button
              size="sm"
              variant="light"
              className="text-gray-300 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: <Home className="h-4 w-4" /> },
              { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
              { id: 'transactions', label: 'Transactions', icon: <DollarSign className="h-4 w-4" /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar name={user?.name || 'Admin'} size="sm" />
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'admin@example.com'}</p>
              </div>
            )}
            <Button
              size="sm"
              variant="light"
              className="text-red-400 hover:text-red-300"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Zinga Linga Admin Dashboard</h1>
            <Button variant="light" onClick={onLogout}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
}