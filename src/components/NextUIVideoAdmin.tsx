'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
  Progress,
  Divider,
  Switch
} from '@nextui-org/react';
import {
  BarChart3,
  Users,
  Video,
  Upload,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  Download,
  Play,
  Image as ImageIcon,
  Youtube,
  Link,
  FileVideo,
  Star,
  Clock,
  Tag,
  ShoppingCart,
  Package
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';

interface VideoProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  videoUrl: string;
  previewUrl?: string;
  category: string;
  ageGroup: string;
  duration: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  sales?: number;
  rating?: number;
}

interface SalesStats {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyGrowth: number;
  topSellingProduct: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalPurchases: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  moduleIds: string[];
  productTitles: string[];
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
}

interface NextUIVideoAdminProps {
  user: any;
  onLogout: () => void;
}

export default function NextUIVideoAdmin({ user, onLogout }: NextUIVideoAdminProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<VideoProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    monthlyGrowth: 0,
    topSellingProduct: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<VideoProduct | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  
  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    ageGroup: '',
    duration: '',
    tags: '',
    isActive: true,
    videoSource: 'file' as 'file' | 'youtube' | 'url',
    videoFile: null as File | null,
    videoUrl: '',
    coverSource: 'file' as 'file' | 'url',
    coverFile: null as File | null,
    coverUrl: '',
    features: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, customersData, ordersData] = await Promise.all([
        vpsDataStore.getProducts(),
        vpsDataStore.getUsers(),
        vpsDataStore.getOrders()
      ]);
      
      setProducts(productsData);
      setCustomers(customersData.filter(u => u.role === 'user'));
      
      // Transform orders data to match our Order interface
      const transformedOrders = ordersData.map(order => {
        const customer = customersData.find(u => u.id === order.userId);
        const productTitles = order.moduleIds?.map(moduleId => {
          const product = productsData.find(p => p.id === moduleId);
          return product?.title || 'Unknown Product';
        }) || [];
        
        return {
          id: order.id,
          userId: order.userId,
          customerName: customer?.name || 'Unknown Customer',
          customerEmail: customer?.email || 'Unknown Email',
          moduleIds: order.moduleIds || [],
          productTitles,
          amount: order.amount,
          paymentMethod: order.paymentMethod || 'Unknown',
          status: order.status,
          createdAt: order.createdAt,
          completedAt: order.completedAt
        };
      });
      
      setOrders(transformedOrders);
      
      // Calculate stats
      const stats = calculateStats(productsData, customersData);
      setSalesStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products: VideoProduct[], customers: Customer[]): SalesStats => {
    const totalRevenue = products.reduce((sum, p) => sum + (p.sales || 0) * p.price, 0);
    const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);
    const topSelling = products.sort((a, b) => (b.sales || 0) - (a.sales || 0))[0];
    
    return {
      totalRevenue,
      totalSales,
      totalProducts: products.length,
      totalCustomers: customers.length,
      monthlyGrowth: 12.5, // Mock data
      topSellingProduct: topSelling?.title || 'N/A'
    };
  };

  const handleProductSubmit = async () => {
    // Basic form validation
    if (!productForm.title.trim()) {
      alert('Please enter a product title');
      return;
    }
    
    if (!productForm.description.trim()) {
      alert('Please enter a product description');
      return;
    }
    
    if (productForm.price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    // Validate video source
    if (productForm.videoSource === 'file' && !productForm.videoFile) {
      alert('Please select a video file to upload');
      return;
    }
    
    if ((productForm.videoSource === 'youtube' || productForm.videoSource === 'url') && !productForm.videoUrl.trim()) {
      alert('Please enter a valid video URL');
      return;
    }
    
    // Validate cover image
    if (productForm.coverSource === 'file' && !productForm.coverFile) {
      alert('Please select a cover image to upload');
      return;
    }
    
    if (productForm.coverSource === 'url' && !productForm.coverUrl.trim()) {
      alert('Please enter a valid cover image URL');
      return;
    }
    
    try {
      // Handle file uploads
      let videoUrl = productForm.videoUrl;
      let thumbnailUrl = productForm.coverUrl;

      // Process video file upload
      if (productForm.videoSource === 'file' && productForm.videoFile) {
        // In a real application, you would upload the file to a server or cloud storage
        // For now, we'll create a placeholder URL
        videoUrl = `uploads/videos/${productForm.videoFile.name}`;
        console.log('Video file selected:', productForm.videoFile.name);
      }

      // Process cover image upload
      if (productForm.coverSource === 'file' && productForm.coverFile) {
        // In a real application, you would upload the file to a server or cloud storage
        // For now, we'll create a placeholder URL
        thumbnailUrl = `uploads/images/${productForm.coverFile.name}`;
        console.log('Cover image selected:', productForm.coverFile.name);
      }

      const productData = {
        ...productForm,
        tags: productForm.tags.split(',').map(tag => tag.trim()),
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl,
        id: isEditing ? selectedProduct?.id : Date.now().toString(),
        createdAt: isEditing ? selectedProduct?.createdAt : new Date().toISOString(),
        sales: isEditing ? selectedProduct?.sales : 0,
        rating: isEditing ? selectedProduct?.rating : 0
      };

      if (isEditing && selectedProduct) {
        await vpsDataStore.updateProduct(selectedProduct.id, productData);
      } else {
        await vpsDataStore.addProduct(productData);
      }
      
      await loadData();
      resetForm();
      onClose();
      
      // Show success message
      alert('Product saved successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      ageGroup: '',
      duration: '',
      tags: '',
      isActive: true,
      videoSource: 'file',
      videoFile: null,
      videoUrl: '',
      coverSource: 'file',
      coverFile: null,
      coverUrl: '',
      features: ''
    });
    setSelectedProduct(null);
    setIsEditing(false);
  };

  const handleEdit = (product: VideoProduct) => {
    setSelectedProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      ageGroup: product.ageGroup,
      duration: product.duration,
      tags: product.tags.join(', '),
      isActive: product.isActive,
      videoSource: 'url',
      videoFile: null,
      videoUrl: product.videoUrl,
      coverSource: 'url',
      coverFile: null,
      coverUrl: product.thumbnail,
      features: ''
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (productId: string) => {
    try {
      await vpsDataStore.deleteProduct(productId);
      await loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Order management handlers
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await vpsDataStore.updateOrderStatus(orderId, status);
      await loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    // Show order details in an alert for now
    // In a real app, you might open a modal with order details
    console.log('Viewing order:', order);
    alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\nAmount: ${formatCurrency(order.amount)}\nStatus: ${order.status}\nPayment Method: ${order.paymentMethod}\nProducts: ${order.productTitles.join(', ')}\nDate: ${new Date(order.createdAt).toLocaleString()}`);
  };

  // User management handlers
  const handleAddUser = async (userData: any) => {
    try {
      await vpsDataStore.addUser(userData);
      await loadData();
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      await vpsDataStore.updateUser(userId, userData);
      await loadData();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await vpsDataStore.deleteUser(userId);
      await loadData();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const handleChangePassword = async (userId: string, newPassword: string) => {
     try {
       await vpsDataStore.changeUserPassword(userId, newPassword);
       alert('Password changed successfully!');
     } catch (error) {
       console.error('Error changing password:', error);
       alert('Error changing password. Please try again.');
     }
   };

   const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Progress size="lg" isIndeterminate aria-label="Loading..." className="max-w-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Video className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Zinga Linga Admin</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" className="flex items-center space-x-2">
                    <Avatar size="sm" name={user?.name || 'Admin'} />
                    <span className="hidden md:block">{user?.name || 'Admin'}</span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="profile" startContent={<Settings className="h-4 w-4" />}>
                    Settings
                  </DropdownItem>
                  <DropdownItem 
                    key="logout" 
                    color="danger" 
                    startContent={<LogOut className="h-4 w-4" />}
                    onClick={onLogout}
                  >
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
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
          <Tab key="dashboard" title={
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          }>
            {/* Dashboard Content */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardBody className="flex flex-row items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(salesStats.totalRevenue)}</p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="flex flex-row items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                      <p className="text-2xl font-bold">{salesStats.totalSales}</p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="flex flex-row items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                      <p className="text-2xl font-bold">{salesStats.totalProducts}</p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="flex flex-row items-center space-x-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
                      <p className="text-2xl font-bold">{salesStats.totalCustomers}</p>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Top Selling Products</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar src={product.thumbnail} size="sm" />
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{product.sales || 0} sales</p>
                            </div>
                          </div>
                          <p className="font-semibold">{formatCurrency(product.price)}</p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Recent Customers</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {customers.slice(0, 5).map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar name={customer.name} size="sm" />
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                            </div>
                          </div>
                          <Chip 
                            color={customer.status === 'active' ? 'success' : 'default'} 
                            size="sm"
                          >
                            {customer.status}
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Tab>

          <Tab key="products" title={
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Products</span>
            </div>
          }>
            {/* Products Content */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Video Products</h2>
                <Button 
                  color="primary" 
                  startContent={<Plus className="h-4 w-4" />}
                  onClick={() => { resetForm(); onOpen(); }}
                >
                  Add New Product
                </Button>
              </div>

              <Card>
                <CardBody>
                  <div className="overflow-x-auto">
                    <Table aria-label="Products table">
                    <TableHeader>
                      <TableColumn>PRODUCT</TableColumn>
                      <TableColumn>CATEGORY</TableColumn>
                      <TableColumn>PRICE</TableColumn>
                      <TableColumn>SALES</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar src={product.thumbnail} size="sm" />
                              <div>
                                <p className="font-medium">{product.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{product.ageGroup}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" variant="flat">{product.category}</Chip>
                          </TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>{product.sales || 0}</TableCell>
                          <TableCell>
                            <Chip 
                              color={product.isActive ? 'success' : 'default'} 
                              size="sm"
                            >
                              {product.isActive ? 'Active' : 'Inactive'}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="light" 
                                isIconOnly
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="light" 
                                color="danger" 
                                isIconOnly
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
          </Tab>

          <Tab key="customers" title={
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </div>
          }>
            {/* Customers Content */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Customers</h2>
              
              <Card>
                <CardBody>
                  <div className="overflow-x-auto">
                    <Table aria-label="Customers table">
                    <TableHeader>
                      <TableColumn>CUSTOMER</TableColumn>
                      <TableColumn>EMAIL</TableColumn>
                      <TableColumn>PURCHASES</TableColumn>
                      <TableColumn>TOTAL SPENT</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>JOIN DATE</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar name={customer.name} size="sm" />
                              <p className="font-medium">{customer.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.totalPurchases}</TableCell>
                          <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                          <TableCell>
                            <Chip 
                              color={customer.status === 'active' ? 'success' : 'default'} 
                              size="sm"
                            >
                              {customer.status}
                            </Chip>
                          </TableCell>
                          <TableCell>{new Date(customer.joinDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="orders" title={
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </div>
          }>
            {/* Orders Content */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Orders Management</h2>
                <div className="flex space-x-2">
                  <Select placeholder="Filter by status" className="w-48">
                    <SelectItem key="all">All Orders</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="completed">Completed</SelectItem>
                    <SelectItem key="failed">Failed</SelectItem>
                    <SelectItem key="refunded">Refunded</SelectItem>
                  </Select>
                </div>
              </div>
              
              <Card>
                <CardBody>
                  <div className="overflow-x-auto">
                    <Table aria-label="Orders table">
                    <TableHeader>
                      <TableColumn>ORDER ID</TableColumn>
                      <TableColumn>CUSTOMER</TableColumn>
                      <TableColumn>PRODUCTS</TableColumn>
                      <TableColumn>AMOUNT</TableColumn>
                      <TableColumn>PAYMENT</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="font-mono text-sm">
                              #{order.id.slice(-8)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-gray-500">{order.customerEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {order.productTitles.slice(0, 2).map((title, index) => (
                                <p key={index} className="text-sm truncate">{title}</p>
                              ))}
                              {order.productTitles.length > 2 && (
                                <p className="text-xs text-gray-500">+{order.productTitles.length - 2} more</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{formatCurrency(order.amount)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Package className="h-3 w-3" />
                              <span className="text-sm">{order.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              color={
                                order.status === 'completed' ? 'success' :
                                order.status === 'pending' ? 'warning' :
                                order.status === 'failed' ? 'danger' : 'default'
                              } 
                              size="sm"
                            >
                              {order.status}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="light"
                                onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                disabled={order.status === 'completed'}
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                onClick={() => handleUpdateOrderStatus(order.id, 'refunded')}
                                disabled={order.status === 'refunded'}
                              >
                                Refund
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
          </Tab>

          <Tab key="users" title={
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </div>
          }>
            {/* User Management Content */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <Button
                  color="primary"
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={() => {
                    // Add user functionality
                    const name = prompt('Enter user name:');
                    const email = prompt('Enter user email:');
                    const password = prompt('Enter user password:');
                    const role = prompt('Enter user role (admin/user/parent):') || 'user';
                    
                    if (name && email && password) {
                      handleAddUser({ name, email, password, role });
                    }
                  }}
                >
                  Add New User
                </Button>
              </div>
              
              <Card>
                <CardBody>
                  <Table aria-label="Users table">
                    <TableHeader>
                      <TableColumn>USER</TableColumn>
                      <TableColumn>EMAIL</TableColumn>
                      <TableColumn>ROLE</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>JOIN DATE</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar
                                src={customer.avatar}
                                name={customer.name}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-gray-500">ID: {customer.id.slice(-8)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{customer.email}</span>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" color="primary">
                              User
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              color={customer.status === 'active' ? 'success' : 'danger'} 
                              size="sm"
                            >
                              {customer.status}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(customer.joinDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="light"
                                startContent={<Edit className="h-3 w-3" />}
                                onPress={() => {
                                  const name = prompt('Enter new name:', customer.name);
                                  const email = prompt('Enter new email:', customer.email);
                                  
                                  if (name && email) {
                                    handleUpdateUser(customer.id, { name, email });
                                  }
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                color="warning"
                                onPress={() => {
                                  const newPassword = prompt('Enter new password:');
                                  if (newPassword) {
                                    handleChangePassword(customer.id, newPassword);
                                  }
                                }}
                              >
                                Reset Password
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                startContent={<Trash2 className="h-3 w-3" />}
                                onPress={() => {
                                  if (confirm(`Are you sure you want to delete user ${customer.name}?`)) {
                                    handleDeleteUser(customer.id);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
              
              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardBody className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {customers.filter(c => c.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {customers.filter(c => c.totalPurchases > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Paying Customers</div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Product Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Title"
                  value={productForm.title}
                  onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                  required
                />
                <Select
                  label="Category"
                  selectedKeys={productForm.category ? [productForm.category] : []}
                  onSelectionChange={(keys) => setProductForm({...productForm, category: Array.from(keys)[0] as string})}
                >
                  <SelectItem key="educational">Educational</SelectItem>
                  <SelectItem key="entertainment">Entertainment</SelectItem>
                  <SelectItem key="adventure">Adventure</SelectItem>
                  <SelectItem key="music">Music</SelectItem>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Price"
                  type="number"
                  value={productForm.price.toString()}
                  onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                  startContent={<DollarSign className="h-4 w-4" />}
                />
                <Input
                  label="Original Price"
                  type="number"
                  value={productForm.originalPrice.toString()}
                  onChange={(e) => setProductForm({...productForm, originalPrice: parseFloat(e.target.value) || 0})}
                  startContent={<DollarSign className="h-4 w-4" />}
                />
                <Select
                  label="Age Group"
                  selectedKeys={productForm.ageGroup ? [productForm.ageGroup] : []}
                  onSelectionChange={(keys) => setProductForm({...productForm, ageGroup: Array.from(keys)[0] as string})}
                >
                  <SelectItem key="3-5">3-5 years</SelectItem>
                  <SelectItem key="6-8">6-8 years</SelectItem>
                  <SelectItem key="9-12">9-12 years</SelectItem>
                  <SelectItem key="all">All Ages</SelectItem>
                </Select>
              </div>

              <Textarea
                label="Description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                rows={3}
              />

              <Divider />
              
              {/* Video Upload Section */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <FileVideo className="h-4 w-4" />
                  <span>Video Source</span>
                </h4>
                
                <Tabs 
                  selectedKey={productForm.videoSource} 
                  onSelectionChange={(key) => setProductForm({...productForm, videoSource: key as any})}
                >
                  <Tab key="file" title="Upload File">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setProductForm({...productForm, videoFile: e.target.files?.[0] || null})}
                    />
                  </Tab>
                  <Tab key="youtube" title="YouTube">
                    <Input
                      label="YouTube URL"
                      value={productForm.videoUrl}
                      onChange={(e) => setProductForm({...productForm, videoUrl: e.target.value})}
                      startContent={<Youtube className="h-4 w-4" />}
                    />
                  </Tab>
                  <Tab key="url" title="Direct URL">
                    <Input
                      label="Video URL"
                      value={productForm.videoUrl}
                      onChange={(e) => setProductForm({...productForm, videoUrl: e.target.value})}
                      startContent={<Link className="h-4 w-4" />}
                    />
                  </Tab>
                </Tabs>
              </div>

              <Divider />
              
              {/* Cover Image Section */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Cover Image</span>
                </h4>
                
                <Tabs 
                  selectedKey={productForm.coverSource} 
                  onSelectionChange={(key) => setProductForm({...productForm, coverSource: key as any})}
                >
                  <Tab key="file" title="Upload File">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProductForm({...productForm, coverFile: e.target.files?.[0] || null})}
                    />
                  </Tab>
                  <Tab key="url" title="Image URL">
                    <Input
                      label="Image URL"
                      value={productForm.coverUrl}
                      onChange={(e) => setProductForm({...productForm, coverUrl: e.target.value})}
                      startContent={<Link className="h-4 w-4" />}
                    />
                  </Tab>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Duration"
                  value={productForm.duration}
                  onChange={(e) => setProductForm({...productForm, duration: e.target.value})}
                  startContent={<Clock className="h-4 w-4" />}
                  placeholder="e.g., 15 minutes"
                />
                <Input
                  label="Tags (comma separated)"
                  value={productForm.tags}
                  onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                  startContent={<Tag className="h-4 w-4" />}
                  placeholder="educational, fun, adventure"
                />
              </div>

              <Switch
                isSelected={productForm.isActive}
                onValueChange={(checked) => setProductForm({...productForm, isActive: checked})}
              >
                Active Product
              </Switch>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleProductSubmit}>
              {isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}