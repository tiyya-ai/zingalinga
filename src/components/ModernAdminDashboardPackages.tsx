// Package Management Functions for ModernAdminDashboard
import React from 'react';
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
  Chip,
  Switch
} from '@nextui-org/react';
import {
  Plus,
  Edit,
  Trash2,
  Package as PackageIcon,
  DollarSign,
  Star,
  Eye,
  X
} from 'lucide-react';

// Professional page header
const PageHeader = ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">{title}</h1>
      <div className="w-12 h-0.5 bg-gray-900"></div>
    </div>
    {actions && <div className="flex gap-2">{actions}</div>}
  </div>
);

export const renderAllPackages = (
  packages: any[], 
  onDeletePackage: (id: string) => void, 
  formatCurrency: (amount: number) => string,
  setActiveSection: (section: string) => void
) => (
  <div className="space-y-6">
    <PageHeader 
      title="All Packages" 
      actions={
        <Button 
          className="bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => setActiveSection('add-package')}
        >
          Add New Package
        </Button>
      }
    />
    
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Learning Packages ({packages.length})</h3>
      </CardHeader>
      <CardBody className="p-0">
        <Table removeWrapper aria-label="Packages table">
          <TableHeader>
            <TableColumn>PACKAGE</TableColumn>
            <TableColumn>TYPE</TableColumn>
            <TableColumn>PRICE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>FEATURES</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No packages found">
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      {pkg.icon ? (
                        <span className="text-2xl">{pkg.icon}</span>
                      ) : (
                        <PackageIcon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{pkg.name}</p>
                      <p className="text-sm text-gray-500">{pkg.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" className="bg-blue-100 text-blue-700">
                    {pkg.type}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-green-600">{formatCurrency(pkg.price || 0)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Chip 
                      size="sm" 
                      color={pkg.isActive ? 'success' : 'danger'} 
                      variant="flat"
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Chip>
                    {pkg.isPopular && (
                      <Chip size="sm" color="warning" variant="flat">
                        Popular
                      </Chip>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {Array.isArray(pkg.features) ? pkg.features.slice(0, 2).join(', ') : 'No features'}
                    {Array.isArray(pkg.features) && pkg.features.length > 2 && '...'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="light"
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="light"
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="light" 
                      className="hover:bg-red-50 transition-colors"
                      onPress={() => {
                        if (confirm(`Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`)) {
                          onDeletePackage(pkg.id);
                        }
                      }}
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
  </div>
);

export const renderAddPackage = (
  packageForm: any, 
  setPackageForm: (form: any) => void, 
  onSavePackage: () => void,
  setActiveSection: (section: string) => void
) => (
  <div className="space-y-6">
    <PageHeader 
      title="Add New Package" 
      actions={
        <Button 
          variant="flat" 
          onPress={() => setActiveSection('all-packages')}
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          startContent={<X className="h-4 w-4" />}
        >
          Cancel
        </Button>
      }
    />
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Package Information</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Package Name *</label>
              <Input
                value={packageForm.name}
                onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                placeholder="Enter package name"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={packageForm.description}
                onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                placeholder="Describe the package"
                rows={4}
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price *</label>
                <Input
                  type="number"
                  value={packageForm.price.toString()}
                  onChange={(e) => setPackageForm({ ...packageForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select
                  selectedKeys={packageForm.type ? [packageForm.type] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setPackageForm({ ...packageForm, type: selected });
                  }}
                  placeholder="Select type"
                  classNames={{
                    trigger: "bg-white border-gray-300 hover:border-purple-400 focus:border-purple-500",
                    popoverContent: "bg-white border border-gray-200 shadow-lg"
                  }}
                >
                  <SelectItem key="subscription">Subscription</SelectItem>
                  <SelectItem key="one-time">One-time Purchase</SelectItem>
                  <SelectItem key="bundle">Bundle</SelectItem>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Features</label>
              <Textarea
                value={packageForm.features}
                onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                placeholder="Enter features separated by commas"
                rows={3}
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                }}
              />
              <p className="text-xs text-gray-500">Separate features with commas</p>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="space-y-6">
        {/* Package Settings */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Package Icon</label>
              <Input
                value={packageForm.icon}
                onChange={(e) => setPackageForm({ ...packageForm, icon: e.target.value })}
                placeholder="🎒 (emoji or icon)"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cover Image URL</label>
              <Input
                value={packageForm.coverImage}
                onChange={(e) => setPackageForm({ ...packageForm, coverImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Active Package</label>
              <Switch
                isSelected={packageForm.isActive}
                onValueChange={(value) => setPackageForm({ ...packageForm, isActive: value })}
                color="success"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Mark as Popular</label>
              <Switch
                isSelected={packageForm.isPopular}
                onValueChange={(value) => setPackageForm({ ...packageForm, isPopular: value })}
                color="warning"
              />
            </div>
          </CardBody>
        </Card>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-purple-600 text-white hover:bg-purple-700 h-12 text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onPress={onSavePackage}
            startContent={<Plus className="h-5 w-5" />}
            isDisabled={!packageForm.name.trim()}
          >
            Create Package
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export const renderLearningPackages = (setActiveSection: (section: string) => void) => (
  <div className="space-y-6">
    <PageHeader title="Learning Packages" />
    
    <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardBody className="p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <PackageIcon className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Learning Packages</h3>
          <p className="text-gray-600 text-lg mb-8">Create and manage learning packages.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Button 
              className="h-24 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onPress={() => setActiveSection('all-packages')}
            >
              <div className="text-center">
                <PackageIcon className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-semibold">All Packages</span>
                <span className="text-xs opacity-80 block">View & manage packages</span>
              </div>
            </Button>
            
            <Button 
              className="h-24 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onPress={() => setActiveSection('add-package')}
            >
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-semibold">Add Package</span>
                <span className="text-xs opacity-80 block">Create new package</span>
              </div>
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  </div>
);