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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Avatar,
  Progress,
  Divider,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Textarea,
  Switch,
  DatePicker,
  Checkbox
} from '@nextui-org/react';
import {
  Play,
  Download,
  CreditCard,
  FileText,
  Eye,
  Clock,
  Star,
  Heart,
  User,
  Settings,
  LogOut,
  ShoppingCart,
  Receipt,
  Calendar,
  BarChart3,
  Video,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  Mail,
  Wallet,
  History,
  PieChart,
  Baby,
  Lock,
  Unlock,
  Timer,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Filter,
  SortAsc,
  ExternalLink
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';

interface EnhancedParentDashboardProps {
  user: any;
  onLogout: () => void;
}

interface WatchHistory {
  id: string;
  videoTitle: string;
  watchedAt: string;
  duration: string;
  watchTime: number;
  completed: boolean;
  childName?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  total: number;
  items: {
    name: string;
    price: number;
    quantity: number;
    category: string;
    videoId?: string;
  }[];
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod: string;
  notes?: string;
  downloadUrl?: string;
}

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  watchTime: number;
  favoriteVideos: string[];
  restrictions: string[];
  screenTimeLimit: number;
  currentSessionTime: number;
  lastActive: string;
  parentalControls: {
    contentRating: string;
    timeRestrictions: boolean;
    allowedCategories: string[];
  };
}

interface VideoProgress {
  videoId: string;
  title: string;
  progress: number;
  lastWatched: string;
  duration: number;
  thumbnail: string;
  category: string;
  rating: number;
  childId: string;
  watchSessions: WatchSession[];
}

interface WatchSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  completed: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
  expiryDate?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  features: string[];
  nextBillingDate: string;
}

interface UsageAnalytics {
  totalWatchTime: number;
  averageSessionTime: number;
  mostWatchedCategory: string;
  peakWatchingHours: string[];
  weeklyUsage: { day: string; minutes: number }[];
  monthlySpending: { month: string; amount: number }[];
}

export default function EnhancedParentDashboard({ user, onLogout }: EnhancedParentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<Partial<PaymentMethod>>({});
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({ items: [] });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const { isOpen: isInvoiceOpen, onOpen: onInvoiceOpen, onClose: onInvoiceClose } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load mock data for demonstration
      setWatchHistory([
        {
          id: '1',
          videoTitle: "Kiki's Adventure - Episode 1",
          watchedAt: new Date().toISOString(),
          duration: '15:30',
          watchTime: 12,
          completed: false,
          childName: 'Emma'
        },
        {
          id: '2',
          videoTitle: "Tano's Learning Journey",
          watchedAt: new Date(Date.now() - 86400000).toISOString(),
          duration: '20:45',
          watchTime: 20,
          completed: true,
          childName: 'Alex'
        }
      ]);

      setInvoices([
        {
          id: 'INV-001',
          invoiceNumber: 'INV-2024-001',
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 1209600000).toISOString(),
          amount: 29.99,
          tax: 2.40,
          total: 32.39,
          items: [
            { name: "Kiki's Adventure Pack", price: 19.99, quantity: 1, category: 'video-pack' },
            { name: "Educational Bundle", price: 9.99, quantity: 1, category: 'educational' }
          ],
          status: 'paid',
          paymentMethod: 'Credit Card',
          notes: 'Video pack purchase',
          downloadUrl: '/invoices/inv-2024-001.pdf'
        },
        {
          id: 'INV-002',
          invoiceNumber: 'INV-2024-002',
          date: new Date(Date.now() - 2592000000).toISOString(),
          dueDate: new Date(Date.now() - 1382400000).toISOString(),
          amount: 15.99,
          tax: 1.28,
          total: 17.27,
          items: [
            { name: "Monthly Subscription", price: 15.99, quantity: 1, category: 'subscription' }
          ],
          status: 'paid',
          paymentMethod: 'PayPal',
          notes: 'Monthly subscription payment'
        }
      ]);

      setChildren([
        {
          id: '1',
          name: 'Emma',
          age: 6,
          watchTime: 45,
          favoriteVideos: ["Kiki's Adventure", "Learning Colors"],
          restrictions: ['No violence', 'Age appropriate only'],
          screenTimeLimit: 120,
          currentSessionTime: 25,
          lastActive: new Date().toISOString(),
          parentalControls: {
            contentRating: 'G',
            timeRestrictions: true,
            allowedCategories: ['educational', 'cartoons', 'music']
          }
        },
        {
          id: '2',
          name: 'Alex',
          age: 8,
          watchTime: 32,
          favoriteVideos: ["Tano's Journey", "Math Fun"],
          restrictions: ['Educational content preferred'],
          screenTimeLimit: 150,
          currentSessionTime: 40,
          lastActive: new Date(Date.now() - 3600000).toISOString(),
          parentalControls: {
            contentRating: 'PG',
            timeRestrictions: true,
            allowedCategories: ['educational', 'adventure', 'science']
          }
        }
      ]);

      // Load video progress data
      setVideoProgress([
        {
          videoId: 'v1',
          title: "Kiki's Adventure - Episode 1",
          progress: 75,
          lastWatched: new Date().toISOString(),
          duration: 1200,
          thumbnail: '/thumbnails/kiki1.jpg',
          category: 'adventure',
          rating: 4.8,
          childId: '1',
          watchSessions: [
            {
              id: 's1',
              startTime: new Date(Date.now() - 900000).toISOString(),
              endTime: new Date().toISOString(),
              duration: 900,
              completed: false
            }
          ]
        },
        {
          videoId: 'v2',
          title: "Learning Numbers with Tano",
          progress: 100,
          lastWatched: new Date(Date.now() - 86400000).toISOString(),
          duration: 900,
          thumbnail: '/thumbnails/tano-numbers.jpg',
          category: 'educational',
          rating: 4.9,
          childId: '2',
          watchSessions: [
            {
              id: 's2',
              startTime: new Date(Date.now() - 87300000).toISOString(),
              endTime: new Date(Date.now() - 86400000).toISOString(),
              duration: 900,
              completed: true
            }
          ]
        }
      ]);

      // Load payment methods
      setPaymentMethods([
        {
          id: 'pm1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          isDefault: true,
          expiryDate: '12/26',
          billingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US'
          }
        },
        {
          id: 'pm2',
          type: 'paypal',
          email: 'parent@example.com',
          isDefault: false
        }
      ]);

      // Load subscription data
      setSubscription({
        id: 'sub1',
        plan: 'Family Premium',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        autoRenew: true,
        price: 29.99,
        features: [
          'Unlimited video access',
          'Up to 5 child profiles',
          'Parental controls',
          'Download for offline viewing',
          'Ad-free experience'
        ],
        nextBillingDate: '2024-02-01'
      });

      // Load usage analytics
      setUsageAnalytics({
        totalWatchTime: 2340,
        averageSessionTime: 25,
        mostWatchedCategory: 'educational',
        peakWatchingHours: ['16:00-18:00', '19:00-20:00'],
        weeklyUsage: [
          { day: 'Mon', minutes: 45 },
          { day: 'Tue', minutes: 60 },
          { day: 'Wed', minutes: 30 },
          { day: 'Thu', minutes: 75 },
          { day: 'Fri', minutes: 90 },
          { day: 'Sat', minutes: 120 },
          { day: 'Sun', minutes: 105 }
        ],
        monthlySpending: [
          { month: 'Oct', amount: 29.99 },
          { month: 'Nov', amount: 29.99 },
          { month: 'Dec', amount: 29.99 },
          { month: 'Jan', amount: 29.99 }
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Payment Methods Handlers
  const handleAddPaymentMethod = async () => {
    try {
      setLoading(true);
      // Simulate API call to add payment method
      const newMethod: PaymentMethod = {
        id: `pm${Date.now()}`,
        type: newPaymentMethod.type || 'card',
        last4: newPaymentMethod.last4 || '0000',
        brand: newPaymentMethod.brand || 'Unknown',
        isDefault: paymentMethods.length === 0,
        expiryDate: newPaymentMethod.expiryDate,
        billingAddress: newPaymentMethod.billingAddress
      };
      
      setPaymentMethods([...paymentMethods, newMethod]);
      setNewPaymentMethod({});
      onPaymentClose();
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      setLoading(true);
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPayment = async (id: string) => {
    try {
      setLoading(true);
      setPaymentMethods(paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === id
      })));
    } catch (error) {
      console.error('Error setting default payment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Invoice Handlers
  const handleCreateInvoice = async () => {
    try {
      setLoading(true);
      const invoice: Invoice = {
        id: `inv${Date.now()}`,
        invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        amount: newInvoice.amount || 0,
        tax: (newInvoice.amount || 0) * 0.08,
        total: (newInvoice.amount || 0) * 1.08,
        status: 'pending',
        items: newInvoice.items || [],
        paymentMethod: paymentMethods.find(pm => pm.isDefault)?.type || 'card',
        notes: newInvoice.notes
      };
      
      setInvoices([invoice, ...invoices]);
      setNewInvoice({ items: [] });
      onInvoiceClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, status: 'paid' as const }
          : inv
      ));
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = invoice.downloadUrl || '#';
    link.download = `${invoice.invoiceNumber}.pdf`;
    link.click();
  };

  // Video Tracking Handlers
  const handleUpdateScreenTime = async (childId: string, newLimit: number) => {
    try {
      setLoading(true);
      setChildren(children.map(child => 
        child.id === childId 
          ? { ...child, screenTimeLimit: newLimit }
          : child
      ));
    } catch (error) {
      console.error('Error updating screen time:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateParentalControls = async (childId: string, controls: any) => {
    try {
      setLoading(true);
      setChildren(children.map(child => 
        child.id === childId 
          ? { ...child, parentalControls: { ...child.parentalControls, ...controls } }
          : child
      ));
    } catch (error) {
      console.error('Error updating parental controls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseVideo = async (videoId: string, childId: string) => {
    try {
      // Simulate pausing video for specific child
      console.log(`Pausing video ${videoId} for child ${childId}`);
    } catch (error) {
      console.error('Error pausing video:', error);
    }
  };

  const handleBlockVideo = async (videoId: string, childId: string) => {
    try {
      setLoading(true);
      // Add video to child's restrictions
      setChildren(children.map(child => 
        child.id === childId 
          ? { ...child, restrictions: [...child.restrictions, `blocked-${videoId}`] }
          : child
      ));
    } catch (error) {
      console.error('Error blocking video:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscription Handlers
  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'cancelled',
          autoRenew: false
        });
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setLoading(true);
      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'active',
          autoRenew: true
        });
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Generate and download invoice PDF
    const invoiceData = `
INVOICE ${invoice.id}
Date: ${new Date(invoice.date).toLocaleDateString()}
Amount: ${formatCurrency(invoice.amount)}
Status: ${invoice.status}

Items:
${invoice.items.map(item => `- ${item.name}: ${formatCurrency(item.price)} x ${item.quantity}`).join('\n')}

Total: ${formatCurrency(invoice.amount)}
Payment Method: ${invoice.paymentMethod}
    `;
    
    const blob = new Blob([invoiceData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Progress size="lg" isIndeterminate aria-label="Loading..." className="max-w-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.name || 'Parent'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="light"
                startContent={<Settings className="h-4 w-4" />}
              >
                Settings
              </Button>
              <Button
                color="danger"
                variant="light"
                startContent={<LogOut className="h-4 w-4" />}
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="w-full"
          variant="underlined"
        >
          <Tab key="overview" title={
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </div>
          }>
            {/* Overview Content */}
            <div className="space-y-6">
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardBody className="flex flex-row items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Watch Time</p>
                      <p className="text-2xl font-bold">{usageAnalytics ? formatDuration(usageAnalytics.totalWatchTime) : '0m'}</p>
                      <p className="text-xs text-blue-600">This month</p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="flex flex-row items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Children</p>
                      <p className="text-2xl font-bold">{children.length}</p>
                      <p className="text-xs text-green-600">Profiles</p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="flex flex-row items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Spending</p>
                      <p className="text-2xl font-bold">{usageAnalytics ? formatCurrency(usageAnalytics.monthlySpending[usageAnalytics.monthlySpending.length - 1]?.amount || 0) : '$0.00'}</p>
                      <p className="text-xs text-purple-600">Current month</p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="flex flex-row items-center space-x-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Session</p>
                      <p className="text-2xl font-bold">{usageAnalytics ? formatDuration(usageAnalytics.averageSessionTime) : '0m'}</p>
                      <p className="text-xs text-orange-600">Per session</p>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Subscription Status */}
              {subscription && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Subscription Status</h3>
                      <Chip 
                        color={subscription.status === 'active' ? 'success' : subscription.status === 'cancelled' ? 'danger' : 'warning'}
                        variant="flat"
                      >
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Chip>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Plan</p>
                        <p className="font-semibold">{subscription.plan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-semibold">{formatCurrency(subscription.price)}/month</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Billing</p>
                        <p className="font-semibold">{formatDate(subscription.nextBillingDate)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      {subscription.status === 'active' ? (
                        <Button 
                          color="danger" 
                          variant="flat" 
                          size="sm"
                          onClick={handleCancelSubscription}
                          isLoading={loading}
                        >
                          Cancel Subscription
                        </Button>
                      ) : (
                        <Button 
                          color="success" 
                          variant="flat" 
                          size="sm"
                          onClick={handleReactivateSubscription}
                          isLoading={loading}
                        >
                          Reactivate Subscription
                        </Button>
                      )}
                      <Switch 
                        isSelected={subscription.autoRenew} 
                        size="sm"
                      >
                        Auto-renew
                      </Switch>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Enhanced Children Overview with Real-time Controls */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Children Activity & Controls</h3>
                    <Button size="sm" startContent={<Plus className="h-4 w-4" />}>
                      Add Child
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {children.map((child) => (
                      <div key={child.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <Avatar name={child.name} />
                            <div>
                              <p className="font-medium">{child.name}</p>
                              <p className="text-sm text-gray-500">Age {child.age} • Last active: {formatDateTime(child.lastActive)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Chip size="sm" color={child.currentSessionTime > 0 ? 'success' : 'default'}>
                              {child.currentSessionTime > 0 ? 'Online' : 'Offline'}
                            </Chip>
                          </div>
                        </div>
                        
                        {/* Screen Time Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Screen Time Today</span>
                            <span className="text-sm text-gray-500">
                              {formatDuration(child.currentSessionTime)} / {formatDuration(child.screenTimeLimit)}
                            </span>
                          </div>
                          <Progress 
                            value={(child.currentSessionTime / child.screenTimeLimit) * 100}
                            color={child.currentSessionTime > child.screenTimeLimit * 0.8 ? 'warning' : 'primary'}
                            className="w-full"
                          />
                        </div>
                        
                        {/* Quick Controls */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="flat" startContent={<Timer className="h-4 w-4" />}>
                            Set Time Limit
                          </Button>
                          <Button size="sm" variant="flat" startContent={<Lock className="h-4 w-4" />}>
                            Pause All Videos
                          </Button>
                          <Button size="sm" variant="flat" startContent={<Settings className="h-4 w-4" />}>
                            Parental Controls
                          </Button>
                          <Button size="sm" variant="flat" startContent={<Eye className="h-4 w-4" />}>
                            View Activity
                          </Button>
                        </div>
                        
                        {/* Current Activity */}
                        {child.currentSessionTime > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <PlayCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Currently watching</span>
                              </div>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="light" color="warning">
                                  <PauseCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="light" color="danger">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Usage Analytics Chart */}
              {usageAnalytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Weekly Usage</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {usageAnalytics.weeklyUsage.map((day, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium w-12">{day.day}</span>
                            <div className="flex-1 mx-3">
                              <Progress 
                                value={(day.minutes / Math.max(...usageAnalytics.weeklyUsage.map(d => d.minutes))) * 100}
                                className="w-full"
                                size="sm"
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-16 text-right">{formatDuration(day.minutes)}</span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Monthly Spending</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {usageAnalytics.monthlySpending.map((month, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium w-12">{month.month}</span>
                            <div className="flex-1 mx-3">
                              <Progress 
                                value={(month.amount / Math.max(...usageAnalytics.monthlySpending.map(m => m.amount))) * 100}
                                className="w-full"
                                size="sm"
                                color="success"
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-20 text-right">{formatCurrency(month.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>
          </Tab>

          <Tab key="watch-history" title={
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Watch History</span>
            </div>
          }>
            {/* Watch History Content */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Watch History</h2>
                <div className="flex space-x-2">
                  <Select placeholder="Filter by child" className="w-48">
                    <SelectItem key="all">All Children</SelectItem>
                    {children.map((child) => (
                      <SelectItem key={child.id}>{child.name}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
              
              <Card>
                <CardBody>
                  <Table aria-label="Watch history table">
                    <TableHeader>
                      <TableColumn>VIDEO</TableColumn>
                      <TableColumn>CHILD</TableColumn>
                      <TableColumn>DURATION</TableColumn>
                      <TableColumn>WATCH TIME</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>DATE</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {watchHistory.map((watch) => (
                        <TableRow key={watch.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-medium">{watch.videoTitle}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar name={watch.childName} size="sm" />
                              <span>{watch.childName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{watch.duration}</TableCell>
                          <TableCell>{formatDuration(watch.watchTime)}</TableCell>
                          <TableCell>
                            <Chip 
                              color={watch.completed ? 'success' : 'warning'} 
                              size="sm"
                            >
                              {watch.completed ? 'Completed' : 'In Progress'}
                            </Chip>
                          </TableCell>
                          <TableCell>{new Date(watch.watchedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="invoices" title={
            <div className="flex items-center space-x-2">
              <Receipt className="h-4 w-4" />
              <span>Invoices & Payments</span>
            </div>
          }>
            {/* Invoices Content */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Invoices & Payment History</h2>
                <Button color="primary" startContent={<Download className="h-4 w-4" />}>
                  Export All
                </Button>
              </div>
              
              <Card>
                <CardBody>
                  <Table aria-label="Invoices table">
                    <TableHeader>
                      <TableColumn>INVOICE ID</TableColumn>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>AMOUNT</TableColumn>
                      <TableColumn>PAYMENT METHOD</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <span className="font-mono text-sm">{invoice.id}</span>
                          </TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4" />
                              <span>{invoice.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              color={
                                invoice.status === 'paid' ? 'success' :
                                invoice.status === 'pending' ? 'warning' : 'danger'
                              } 
                              size="sm"
                            >
                              {invoice.status}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="light"
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                onClick={() => handleDownloadInvoice(invoice)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="payments" title={
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Payment Methods</span>
            </div>
          }>
            <div className="space-y-6">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Payment Methods</h3>
                    <Button 
                      color="primary" 
                      startContent={<Plus className="h-4 w-4" />}
                      onPress={onPaymentOpen}
                    >
                      Add Payment Method
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            {method.type === 'card' && <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                            {method.type === 'paypal' && <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                            {method.type === 'bank' && <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                          </div>
                          <div>
                            <p className="font-medium">
                              {method.type === 'card' && `${method.brand} ending in ${method.last4}`}
                              {method.type === 'paypal' && `PayPal (${method.email})`}
                              {method.type === 'bank' && `Bank Account ending in ${method.last4}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {method.expiryDate && `Expires ${method.expiryDate}`}
                              {method.type === 'paypal' && 'PayPal Account'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && <Chip size="sm" color="success">Default</Chip>}
                          <Button 
                            size="sm" 
                            variant="light"
                            onClick={() => handleSetDefaultPayment(method.id)}
                            isDisabled={method.isDefault}
                          >
                            {method.isDefault ? 'Default' : 'Set Default'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="light" 
                            color="danger"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {paymentMethods.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No payment methods added yet</p>
                        <p className="text-sm">Add a payment method to start making purchases</p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Enhanced Invoices */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Invoices & Billing History</h3>
                    <div className="flex space-x-2">
                      <Button 
                        color="primary" 
                        variant="flat"
                        startContent={<Plus className="h-4 w-4" />}
                        onPress={onInvoiceOpen}
                      >
                        Create Invoice
                      </Button>
                      <Button 
                        color="primary" 
                        startContent={<Download className="h-4 w-4" />}
                      >
                        Export All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <Table aria-label="Enhanced invoices table">
                    <TableHeader>
                      <TableColumn>INVOICE #</TableColumn>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>DUE DATE</TableColumn>
                      <TableColumn>AMOUNT</TableColumn>
                      <TableColumn>TAX</TableColumn>
                      <TableColumn>TOTAL</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{invoice.invoiceNumber}</p>
                              <p className="text-xs text-gray-500">{invoice.paymentMethod}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>{formatCurrency(invoice.tax)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                          <TableCell>
                            <Chip 
                              size="sm" 
                              color={
                                invoice.status === 'paid' ? 'success' : 
                                invoice.status === 'pending' ? 'warning' : 
                                invoice.status === 'overdue' ? 'danger' : 'default'
                              }
                              variant="flat"
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="light" onClick={() => handleViewInvoice(invoice)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="light"
                                onClick={() => handleDownloadInvoice(invoice)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {invoice.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  color="success"
                                  variant="flat"
                                  onClick={() => handlePayInvoice(invoice.id)}
                                  isLoading={loading}
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="light">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {invoices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No invoices found</p>
                      <p className="text-sm">Your billing history will appear here</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardBody className="text-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-fit mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-gray-600">Paid This Month</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(invoices.filter(inv => 
                        inv.status === 'paid' && 
                        new Date(inv.date).getMonth() === new Date().getMonth()
                      ).reduce((acc, inv) => acc + inv.total, 0))}
                    </p>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody className="text-center">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg w-fit mx-auto mb-3">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-sm text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(invoices.filter(inv => inv.status === 'pending').reduce((acc, inv) => acc + inv.total, 0))}
                    </p>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody className="text-center">
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg w-fit mx-auto mb-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(invoices.filter(inv => inv.status === 'overdue').reduce((acc, inv) => acc + inv.total, 0))}
                    </p>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Tab>

          <Tab key="video-tracking" title={
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Video Tracking</span>
            </div>
          }>
            <div className="space-y-6">
              {/* Real-time Video Monitoring */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Real-time Video Monitoring</h3>
                    <div className="flex space-x-2">
                      <Select 
                        size="sm" 
                        placeholder="Filter by child"
                        className="w-40"
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                      >
                        <SelectItem key="all">All Children</SelectItem>
                        {children.map((child) => (
                          <SelectItem key={child.id}>{child.name}</SelectItem>
                        ))}
                      </Select>
                      <Select 
                        size="sm" 
                        placeholder="Category"
                        className="w-32"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <SelectItem key="all">All</SelectItem>
                        <SelectItem key="educational">Educational</SelectItem>
                        <SelectItem key="adventure">Adventure</SelectItem>
                        <SelectItem key="music">Music</SelectItem>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <Table aria-label="Video tracking table">
                    <TableHeader>
                      <TableColumn>VIDEO</TableColumn>
                      <TableColumn>CHILD</TableColumn>
                      <TableColumn>PROGRESS</TableColumn>
                      <TableColumn>LAST WATCHED</TableColumn>
                      <TableColumn>CATEGORY</TableColumn>
                      <TableColumn>RATING</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {videoProgress
                        .filter(video => selectedChild === 'all' || selectedChild === '' || video.childId === selectedChild)
                        .filter(video => filterCategory === 'all' || video.category === filterCategory)
                        .map((video) => {
                          const child = children.find(c => c.id === video.childId);
                          return (
                            <TableRow key={`${video.videoId}-${video.childId}`}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                                    <Video className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{video.title}</p>
                                    <p className="text-xs text-gray-500">{formatDuration(video.duration / 60)}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Avatar name={child?.name} size="sm" />
                                  <span className="text-sm">{child?.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="w-full">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>{video.progress}%</span>
                                    <span>{formatDuration((video.duration * video.progress) / 100 / 60)}</span>
                                  </div>
                                  <Progress value={video.progress} size="sm" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{formatDateTime(video.lastWatched)}</span>
                              </TableCell>
                              <TableCell>
                                <Chip size="sm" variant="flat" color="primary">
                                  {video.category}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-sm">{video.rating}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    size="sm" 
                                    variant="light" 
                                    color="warning"
                                    onClick={() => handlePauseVideo(video.videoId, video.childId)}
                                  >
                                    <PauseCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="light" 
                                    color="danger"
                                    onClick={() => handleBlockVideo(video.videoId, video.childId)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="light">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      }
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>

              {/* Watch Sessions Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Today's Activity</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar name={child.name} size="sm" />
                            <div>
                              <p className="font-medium text-sm">{child.name}</p>
                              <p className="text-xs text-gray-500">
                                {child.currentSessionTime > 0 ? 'Currently watching' : 'Offline'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatDuration(child.currentSessionTime)}</p>
                            <p className="text-xs text-gray-500">of {formatDuration(child.screenTimeLimit)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Content Categories</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {['educational', 'adventure', 'music', 'cartoons'].map((category) => {
                        const categoryVideos = videoProgress.filter(v => v.category === category);
                        const totalTime = categoryVideos.reduce((acc, v) => acc + (v.duration * v.progress / 100), 0);
                        const maxTime = Math.max(...['educational', 'adventure', 'music', 'cartoons'].map(cat => 
                          videoProgress.filter(v => v.category === cat).reduce((acc, v) => acc + (v.duration * v.progress / 100), 0)
                        ));
                        
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{category}</span>
                            <div className="flex items-center space-x-2 flex-1 mx-3">
                              <Progress 
                                value={maxTime > 0 ? (totalTime / maxTime) * 100 : 0}
                                size="sm" 
                                className="flex-1"
                              />
                            </div>
                            <span className="text-sm text-gray-500">{formatDuration(totalTime / 60)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Tab>

          <Tab key="children" title={
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Children Profiles</span>
            </div>
          }>
            {/* Children Management Content */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Children Profiles & Controls</h2>
                <Button color="primary" startContent={<User className="h-4 w-4" />}>
                  Add Child
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {children.map((child) => (
                  <Card key={child.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Avatar name={child.name} size="lg" />
                        <div>
                          <h3 className="text-lg font-semibold">{child.name}</h3>
                          <p className="text-sm text-gray-500">Age {child.age}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Watch Time This Month</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={(child.watchTime / 100) * 100} className="flex-1" />
                          <span className="text-sm">{formatDuration(child.watchTime)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Favorite Videos</p>
                        <div className="flex flex-wrap gap-1">
                          {child.favoriteVideos.map((video, index) => (
                            <Chip key={index} size="sm" variant="flat">
                              {video}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Parental Controls</p>
                        <div className="flex flex-wrap gap-1">
                          {child.restrictions.map((restriction, index) => (
                            <Chip key={index} size="sm" color="warning" variant="flat">
                              {restriction}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="light">
                          Edit Profile
                        </Button>
                        <Button size="sm" variant="light" color="warning">
                          Manage Controls
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3>Invoice Details - {selectedInvoice?.id}</h3>
          </ModalHeader>
          <ModalBody>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Invoice Date</p>
                    <p className="text-sm text-gray-600">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm text-gray-600">{selectedInvoice.paymentMethod}</p>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{formatCurrency(item.price)} x {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Divider />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-semibold text-lg">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
            <Button 
              color="primary" 
              onPress={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}
            >
              Download PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <h3>Add Payment Method</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select 
                label="Payment Type" 
                placeholder="Select payment type"
                value={newPaymentMethod.type}
                onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value as any})}
              >
                <SelectItem key="card">Credit/Debit Card</SelectItem>
                <SelectItem key="paypal">PayPal</SelectItem>
                <SelectItem key="bank">Bank Account</SelectItem>
              </Select>
              
              {newPaymentMethod.type === 'card' && (
                <>
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    value={newPaymentMethod.last4}
                    onChange={(e) => setNewPaymentMethod({...newPaymentMethod, last4: e.target.value.slice(-4)})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={newPaymentMethod.expiryDate}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, expiryDate: e.target.value})}
                    />
                    <Input
                      label="CVV"
                      placeholder="123"
                      type="password"
                    />
                  </div>
                  <Input
                    label="Cardholder Name"
                    placeholder="John Doe"
                  />
                </>
              )}
              
              {newPaymentMethod.type === 'paypal' && (
                <Input
                  label="PayPal Email"
                  placeholder="email@example.com"
                  type="email"
                  value={newPaymentMethod.email}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, email: e.target.value})}
                />
              )}
              
              <Checkbox>
                Set as default payment method
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onPaymentClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleAddPaymentMethod}
              isLoading={loading}
            >
              Add Payment Method
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal isOpen={isInvoiceOpen} onClose={onInvoiceClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3>Create New Invoice</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  label="Due Date"
                  value={newInvoice.dueDate}
                  onChange={(date) => setNewInvoice({...newInvoice, dueDate: date?.toString()})}
                />
                <Input
                  label="Amount"
                  placeholder="0.00"
                  type="number"
                  startContent="$"
                  value={newInvoice.amount?.toString()}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: parseFloat(e.target.value)})}
                />
              </div>
              
              <Textarea
                label="Notes"
                placeholder="Invoice description or notes..."
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
              />
              
              <div>
                <p className="text-sm font-medium mb-2">Invoice Items</p>
                <Button 
                  size="sm" 
                  variant="flat" 
                  startContent={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    const newItem = { name: '', price: 0, quantity: 1, category: 'service' };
                    setNewInvoice({
                      ...newInvoice, 
                      items: [...(newInvoice.items || []), newItem]
                    });
                  }}
                >
                  Add Item
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onInvoiceClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleCreateInvoice}
              isLoading={loading}
            >
              Create Invoice
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}