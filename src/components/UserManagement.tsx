import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
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
  Progress
} from '@nextui-org/react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  X,
  Mail,
  Smartphone,
  Lock,
  Shield,
  Settings,
  UserCheck,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';

interface UserManagementProps {
  users: any[];
  setUsers: (users: any[]) => void;
  orders: any[];
  onNavigate: (section: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, orders, onNavigate }) => {
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin' | 'moderator',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    avatar: '',
    phone: '',
    dateOfBirth: '',
    subscription: 'free' as 'free' | 'basic' | 'premium' | 'family'
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('all-users');
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const PageHeader = ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">{title}</h1>
        <div className="w-12 h-0.5 bg-gray-900"></div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );

  const StatsGrid = ({ stats }: { stats: Array<{ label: string; value: string | number; color: string; change?: string; icon?: React.ReactNode }> }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                {stat.change && <div className="text-xs text-gray-500 mt-1">{stat.change}</div>}
              </div>
              {stat.icon && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {stat.icon}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user',
      status: user.status || 'active',
      avatar: user.avatar || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      subscription: user.subscription || 'free'
    });
    setActiveSection('add-user');
  };

  const handleSaveUser = async () => {
    try {
      if (!userForm.name.trim()) {
        alert('Please enter a name');
        return;
      }
      if (!userForm.email.trim()) {
        alert('Please enter an email');
        return;
      }
      if (!editingUser && !userForm.password.trim()) {
        alert('Please enter a password for new users');
        return;
      }
      
      if (editingUser) {
        const updatedUser = {
          ...editingUser,
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          status: userForm.status,
          avatar: userForm.avatar,
          phone: userForm.phone,
          dateOfBirth: userForm.dateOfBirth,
          subscription: userForm.subscription,
          updatedAt: new Date().toISOString()
        };
        
        const success = await vpsDataStore.updateUser(updatedUser);
        if (success) {
          setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
          alert('✅ User updated successfully!');
        } else {
          alert('❌ Failed to update user.');
          return;
        }
      } else {
        const newUser = {
          id: Date.now().toString(),
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          status: userForm.status,
          avatar: userForm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userForm.name)}&background=random`,
          phone: userForm.phone,
          dateOfBirth: userForm.dateOfBirth,
          subscription: userForm.subscription,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        const success = await vpsDataStore.addUser(newUser);
        if (success) {
          setUsers([...users, newUser]);
          alert('✅ User created successfully!');
        } else {
          alert('❌ Failed to create user.');
          return;
        }
      }
      
      setActiveSection('all-users');
      setEditingUser(null);
      
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        avatar: '',
        phone: '',
        dateOfBirth: '',
        subscription: 'free'
      });
    } catch (error) {
      console.error('❌ Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const success = await vpsDataStore.deleteUser(userId);
      if (success) {
        setUsers(users.filter(u => u.id !== userId));
        alert('✅ User deleted successfully!');
      } else {
        alert('❌ Failed to delete user.');
      }
    }
  };

  const renderAllUsers = () => (
    <div className="space-y-6">
      <PageHeader 
        title="User Management" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => {
              setEditingUser(null);
              setUserForm({
                name: '',
                email: '',
                password: '',
                role: 'user',
                status: 'active',
                avatar: '',
                phone: '',
                dateOfBirth: '',
                subscription: 'free'
              });
              setActiveSection('add-user');
            }}
          >
            Add New User
          </Button>
        }
      />
      
      <StatsGrid stats={[
        { 
          label: 'Total Users', 
          value: users.length, 
          color: '', 
          change: 'All registered users',
          icon: <Users className="h-6 w-6 text-blue-600" />
        },
        { 
          label: 'Active Users', 
          value: users.filter(u => u.status === 'active').length, 
          color: '', 
          change: 'Currently active',
          icon: <UserCheck className="h-6 w-6 text-green-600" />
        },
        { 
          label: 'Premium Users', 
          value: users.filter(u => u.subscription === 'premium').length, 
          color: '', 
          change: 'Premium subscribers',
          icon: <Award className="h-6 w-6 text-purple-600" />
        },
        { 
          label: 'New This Month', 
          value: users.filter(u => {
            const createdDate = new Date(u.createdAt);
            const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return createdDate >= oneMonthAgo;
          }).length, 
          color: '', 
          change: 'Recent signups',
          icon: <TrendingUp className="h-6 w-6 text-orange-600" />
        }
      ]} />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Search users..."
                startContent={<Search className="h-4 w-4" />}
                className="w-64"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
                }}
              />
              <Select
                selectedKeys={[userFilter]}
                onSelectionChange={(keys) => setUserFilter(Array.from(keys)[0] as string)}
                className="w-32"
                startContent={<Filter className="h-4 w-4" />}
              >
                <SelectItem key="all">All Users</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
                <SelectItem key="premium">Premium</SelectItem>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Users table">
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>SUBSCRIPTION</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No users found">
              {users.filter(user => {
                if (userFilter === 'all') return true;
                if (userFilter === 'active') return user.status === 'active';
                if (userFilter === 'inactive') return user.status === 'inactive';
                if (userFilter === 'premium') return user.subscription === 'premium';
                return true;
              }).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id.slice(-6)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={user.role === 'admin' ? 'danger' : user.role === 'moderator' ? 'warning' : 'default'} 
                      variant="flat"
                    >
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={user.subscription === 'premium' ? 'secondary' : user.subscription === 'basic' ? 'primary' : 'default'} 
                      variant="flat"
                    >
                      {user.subscription}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'warning'} 
                      variant="flat"
                    >
                      {user.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="light"
                        onPress={() => {
                          setSelectedUser(user);
                          onUserModalOpen();
                        }}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light"
                        onPress={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light" 
                        className="hover:bg-red-50"
                        onPress={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      
      <Modal 
        isOpen={isUserModalOpen} 
        onClose={onUserModalClose} 
        size="2xl"
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/40"
        }}
      >
        <ModalContent>
          <ModalHeader>User Details - {selectedUser?.name}</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xl font-medium">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Chip size="sm" color={selectedUser.status === 'active' ? 'success' : 'warning'} variant="flat">
                        {selectedUser.status}
                      </Chip>
                      <Chip size="sm" color="primary" variant="flat">
                        {selectedUser.role}
                      </Chip>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Account Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">User ID:</span> {selectedUser.id}</div>
                      <div><span className="font-medium">Phone:</span> {selectedUser.phone || 'Not provided'}</div>
                      <div><span className="font-medium">Date of Birth:</span> {selectedUser.dateOfBirth || 'Not provided'}</div>
                      <div><span className="font-medium">Subscription:</span> {selectedUser.subscription}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Activity</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                      <div><span className="font-medium">Last Login:</span> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}</div>
                      <div><span className="font-medium">Total Spent:</span> ${selectedUser.totalSpent || 0}</div>
                      <div><span className="font-medium">Orders:</span> {orders.filter(o => o.customer.email === selectedUser.email).length}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recent Orders</h4>
                  <div className="space-y-2">
                    {orders.filter(o => o.customer.email === selectedUser.email).slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{order.item.name}</p>
                          <p className="text-xs text-gray-500">{order.date.toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${order.amount}</p>
                          <Chip size="sm" color={order.status === 'completed' ? 'success' : 'warning'} variant="flat">
                            {order.status}
                          </Chip>
                        </div>
                      </div>
                    ))}
                    {orders.filter(o => o.customer.email === selectedUser.email).length === 0 && (
                      <p className="text-gray-500 text-sm">No orders found</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onUserModalClose}>Close</Button>
            <Button color="primary" onPress={() => {
              onUserModalClose();
              if (selectedUser) handleEditUser(selectedUser);
            }}>Edit User</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );

  const renderAddUser = () => (
    <div className="space-y-6">
      <PageHeader 
        title={editingUser ? 'Edit User' : 'Add New User'}
        actions={
          <Button 
            variant="flat" 
            onPress={() => setActiveSection('all-users')}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            startContent={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <Input
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Enter full name"
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address *</label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="Enter email address"
                    startContent={<Mail className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
              </div>
              
              {!editingUser && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password *</label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Enter password"
                    startContent={<Lock className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <Input
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                    startContent={<Smartphone className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <Input
                    type="date"
                    value={userForm.dateOfBirth}
                    onChange={(e) => setUserForm({ ...userForm, dateOfBirth: e.target.value })}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                  {userForm.avatar ? (
                    <img src={userForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-medium">
                      {userForm.name.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Avatar URL</label>
                    <Input
                      value={userForm.avatar}
                      onChange={(e) => setUserForm({ ...userForm, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      startContent={<ImageIcon className="h-4 w-4 text-gray-400" />}
                      classNames={{
                        input: "bg-white",
                        inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Or leave empty to use auto-generated avatar</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Select
                  selectedKeys={[userForm.role]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as 'user' | 'admin' | 'moderator';
                    setUserForm({ ...userForm, role: selected });
                  }}
                  classNames={{
                    trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500"
                  }}
                >
                  <SelectItem key="user" value="user">User</SelectItem>
                  <SelectItem key="moderator" value="moderator">Moderator</SelectItem>
                  <SelectItem key="admin" value="admin">Admin</SelectItem>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  selectedKeys={[userForm.status]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as 'active' | 'inactive' | 'suspended';
                    setUserForm({ ...userForm, status: selected });
                  }}
                  classNames={{
                    trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500"
                  }}
                >
                  <SelectItem key="active" value="active">Active</SelectItem>
                  <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                  <SelectItem key="suspended" value="suspended">Suspended</SelectItem>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subscription</label>
                <Select
                  selectedKeys={[userForm.subscription]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as 'free' | 'basic' | 'premium' | 'family';
                    setUserForm({ ...userForm, subscription: selected });
                  }}
                  classNames={{
                    trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500"
                  }}
                >
                  <SelectItem key="free" value="free">Free</SelectItem>
                  <SelectItem key="basic" value="basic">Basic</SelectItem>
                  <SelectItem key="premium" value="premium">Premium</SelectItem>
                  <SelectItem key="family" value="family">Family</SelectItem>
                </Select>
              </div>
            </CardBody>
          </Card>

          <div className="space-y-3">
            <Button 
              className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 text-lg font-semibold"
              onPress={handleSaveUser}
              startContent={editingUser ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              isDisabled={!userForm.name.trim() || !userForm.email.trim() || (!editingUser && !userForm.password.trim())}
            >
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
            
            {editingUser && (
              <Button 
                variant="flat"
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 h-10"
                startContent={<Trash2 className="h-4 w-4" />}
                onPress={() => {
                  handleDeleteUser(editingUser.id);
                  setActiveSection('all-users');
                }}
              >
                Delete User
              </Button>
            )}
          </div>

          <Card className="bg-blue-50 border border-blue-200">
            <CardBody className="p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                User Management Tips
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Admin users have full system access</li>
                <li>• Moderators can manage content and users</li>
                <li>• Suspended users cannot access the platform</li>
                <li>• Premium users get access to all content</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderUserRoles = () => (
    <div className="space-y-6">
      <PageHeader title="User Roles & Permissions" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User</h3>
                <p className="text-sm text-gray-500">Standard access</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'user').length}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Permissions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  View content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Purchase content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Manage profile
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-red-500" />
                  Admin access
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Moderator</h3>
                <p className="text-sm text-gray-500">Content management</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => u.role === 'moderator').length}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Permissions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  All user permissions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Manage content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Moderate comments
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-red-500" />
                  System settings
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admin</h3>
                <p className="text-sm text-gray-500">Full access</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Permissions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  All permissions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  User management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  System settings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Analytics access
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Role Distribution</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {['user', 'moderator', 'admin'].map((role) => {
              const count = users.filter(u => u.role === role).length;
              const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
              
              return (
                <div key={role} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">{role}s</span>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="w-full" 
                    color={role === 'admin' ? 'danger' : role === 'moderator' ? 'warning' : 'primary'}
                  />
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  switch (activeSection) {
    case 'all-users':
      return renderAllUsers();
    case 'add-user':
      return renderAddUser();
    case 'user-roles':
      return renderUserRoles();
    default:
      return renderAllUsers();
  }
};