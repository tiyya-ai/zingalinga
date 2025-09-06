'use client';

import React, { useState, useEffect } from 'react';
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
  Chip
} from '@nextui-org/react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RotateCcw
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'moderator';
  phone?: string;
  subscription?: 'free' | 'basic' | 'premium' | 'family';
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin' | 'moderator',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    phone: '',
    subscription: 'free' as 'free' | 'basic' | 'premium' | 'family'
  });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = response.ok ? await response.json() : [];
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCreateUser = async () => {
    try {
      if (!userForm.name.trim() || !userForm.email.trim() || (!editingUser && !userForm.password.trim())) {
        setToast({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      const userData = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        status: userForm.status,
        phone: userForm.phone.trim() || null,
        subscription: userForm.subscription,
        ...(userForm.password.trim() && { password: userForm.password.trim() })
      };

      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        await loadUsers();
        setToast({ 
          message: editingUser ? 'User updated successfully!' : 'User created successfully!', 
          type: 'success' 
        });
        onModalClose();
        resetForm();
      } else {
        const error = await response.json();
        setToast({ message: error.error || 'Failed to save user', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setToast({ message: 'Error saving user', type: 'error' });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      
      if (response.ok) {
        await loadUsers();
        setToast({ message: 'User deleted successfully!', type: 'success' });
      } else {
        const error = await response.json();
        setToast({ message: error.error || 'Failed to delete user', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setToast({ message: 'Error deleting user', type: 'error' });
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      subscription: user.subscription || 'free'
    });
    onModalOpen();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    resetForm();
    onModalOpen();
  };

  const resetForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'user',
      status: 'active',
      phone: '',
      subscription: 'free'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">User Management</h1>
          <div className="w-12 h-0.5 bg-gray-900"></div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            startContent={<RotateCcw className="h-4 w-4" />}
            onPress={loadUsers}
          >
            Refresh
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            startContent={<Plus className="h-4 w-4" />}
            onPress={openCreateModal}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{users.length}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.subscription === 'premium').length}
                </div>
                <div className="text-sm text-gray-600">Premium</div>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold text-gray-900">All Users ({filteredUsers.length})</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Select
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
                className="w-32"
                startContent={<Filter className="h-4 w-4" />}
              >
                <SelectItem key="all">All Status</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
                <SelectItem key="suspended">Suspended</SelectItem>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table removeWrapper>
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={loading ? "Loading..." : "No users found"}>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id.slice(-8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip size="sm" color="primary" variant="flat">
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={user.status === 'active' ? 'success' : user.status === 'inactive' ? 'warning' : 'danger'} 
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
                        className="hover:bg-blue-50"
                        onPress={() => openEditModal(user)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light" 
                        className="hover:bg-red-50"
                        onPress={() => handleDeleteUser(user.id, user.name)}
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

      {/* User Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {editingUser ? 'Edit User' : 'Create New User'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                placeholder="Enter full name"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                required
              />
              <Input
                placeholder="Enter email address"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
              <Input
                placeholder={editingUser ? "New password (leave blank to keep current)" : "Enter password"}
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                required={!editingUser}
              />
              <Input
                placeholder="Enter phone number (optional)"
                value={userForm.phone}
                onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Role"
                  selectedKeys={[userForm.role]}
                  onSelectionChange={(keys) => setUserForm({...userForm, role: Array.from(keys)[0] as any})}
                >
                  <SelectItem key="user">User</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                  <SelectItem key="moderator">Moderator</SelectItem>
                </Select>
                <Select
                  label="Status"
                  selectedKeys={[userForm.status]}
                  onSelectionChange={(keys) => setUserForm({...userForm, status: Array.from(keys)[0] as any})}
                >
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                  <SelectItem key="suspended">Suspended</SelectItem>
                </Select>
              </div>

            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateUser}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}