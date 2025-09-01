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
  X,
  Upload,
  Video,
  Headphones,
  BookOpen
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
  handleSetActiveSection: (section: string) => void,
  onEditPackage?: (pkg: any) => void,
  onPreviewPackage?: (pkg: any) => void
) => (
  <div className="space-y-6">
    <PageHeader 
      title="All Packages" 
      actions={
        <Button 
          className="bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => handleSetActiveSection('add-package')}
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
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="light"
                      className="hover:bg-blue-50 transition-colors"
                      onPress={() => {
                        if (onPreviewPackage) {
                          onPreviewPackage(pkg);
                        } else {
                          alert(`Preview for "${pkg.name}"\n\nName: ${pkg.name}\nType: ${pkg.type}\nPrice: ${formatCurrency(pkg.price || 0)}\nDescription: ${pkg.description}\nStatus: ${pkg.isActive ? 'Active' : 'Inactive'}${pkg.isPopular ? ' (Popular)' : ''}`);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="light"
                      className="hover:bg-blue-50 transition-colors"
                      onPress={() => {
                        if (onEditPackage) {
                          onEditPackage(pkg);
                        } else {
                          console.log('Edit package:', pkg.id);
                        }
                      }}
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
  handleSetActiveSection: (section: string) => void,
  editingPackage?: any,
  availableContent?: any[]
) => {
  console.log('🎯 renderAddPackage called with onSavePackage:', typeof onSavePackage);
  console.log('📝 Current packageForm:', packageForm);
  
  return (
  <div className="space-y-6">
    <PageHeader 
      title={editingPackage ? "Edit Package" : "Add New Package"} 
      actions={
        <Button 
          variant="flat" 
          onPress={() => handleSetActiveSection('all-packages')}
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

        {/* Content Selection */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Package Content</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Content Items</label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Content */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Available Content (Click to select/deselect)</h4>
                  <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {availableContent && availableContent.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {availableContent.map((content) => {
                          const isSelected = packageForm.contentIds?.includes(content.id);
                          const contentType = content.category === 'Audio Lessons' || content.type === 'audio' ? 'audio' : 
                                            content.category === 'PP1 Program' ? 'pp1' : 'video';
                          
                          return (
                            <div key={content.id} className={`p-3 hover:bg-gray-50 cursor-pointer ${
                              isSelected ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                            }`} onClick={() => {
                              const currentIds = packageForm.contentIds || [];
                              if (isSelected) {
                                setPackageForm({ ...packageForm, contentIds: currentIds.filter((id: string) => id !== content.id) });
                              } else {
                                setPackageForm({ ...packageForm, contentIds: [...currentIds, content.id] });
                              }
                            }}>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  contentType === 'audio' ? 'bg-green-100' :
                                  contentType === 'pp1' ? 'bg-orange-100' : 'bg-blue-100'
                                }`}>
                                  {contentType === 'audio' ? (
                                    <Headphones className="h-4 w-4 text-green-600" />
                                  ) : contentType === 'pp1' ? (
                                    <BookOpen className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <Video className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{content.title}</p>
                                  <p className="text-xs text-gray-500">{content.category}</p>
                                </div>
                                {isSelected ? (
                                  <X className="h-4 w-4 text-purple-600" />
                                ) : (
                                  <Plus className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-3xl mb-2">📦</div>
                        <p className="text-gray-500 text-sm">No content available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Content */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Content ({packageForm.contentIds?.length || 0})</h4>
                  <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {packageForm.contentIds && packageForm.contentIds.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {packageForm.contentIds.map((contentId: string) => {
                          const content = availableContent?.find(c => c.id === contentId);
                          if (!content) {
                            return (
                              <div key={contentId} className="p-3 bg-red-50 border-l-4 border-red-400">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
                                    <X className="h-4 w-4 text-red-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-red-900">Deleted Content</p>
                                    <p className="text-xs text-red-600">ID: {contentId}</p>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const currentIds = packageForm.contentIds || [];
                                      setPackageForm({ ...packageForm, contentIds: currentIds.filter((id: string) => id !== contentId) });
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          
                          const contentType = content.category === 'Audio Lessons' || content.type === 'audio' ? 'audio' : 
                                            content.category === 'PP1 Program' ? 'pp1' : 'video';
                          
                          return (
                            <div key={contentId} className="p-3 hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  contentType === 'audio' ? 'bg-green-100' :
                                  contentType === 'pp1' ? 'bg-orange-100' : 'bg-blue-100'
                                }`}>
                                  {contentType === 'audio' ? (
                                    <Headphones className="h-4 w-4 text-green-600" />
                                  ) : contentType === 'pp1' ? (
                                    <BookOpen className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <Video className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{content.title}</p>
                                  <p className="text-xs text-gray-500">{content.category}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    const currentIds = packageForm.contentIds || [];
                                    setPackageForm({ ...packageForm, contentIds: currentIds.filter((id: string) => id !== contentId) });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-3xl mb-2">📋</div>
                        <p className="text-gray-500 text-sm">No content selected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
              <label className="text-sm font-medium text-gray-700">Package Media</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        setPackageForm({ ...packageForm, coverImage: result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="package-media-upload"
                />
                <label htmlFor="package-media-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    {packageForm.coverImage ? (
                      <div className="w-full max-w-xs">
                        {packageForm.coverImage.startsWith('data:video') ? (
                          <video 
                            src={packageForm.coverImage} 
                            className="w-full h-24 object-cover rounded-lg"
                            controls={false}
                          />
                        ) : (
                          <img 
                            src={packageForm.coverImage} 
                            alt="Package preview" 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload image or video</p>
                      </>
                    )}
                    <p className="text-xs text-gray-500">JPG, PNG, MP4, MOV up to 10MB</p>
                  </div>
                </label>
              </div>
              {packageForm.coverImage && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => setPackageForm({ ...packageForm, coverImage: '' })}
                  className="w-full"
                >
                  Remove Media
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Or use URL instead</label>
              <Input
                value={packageForm.coverImage?.startsWith('http') ? packageForm.coverImage : ''}
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
            onPress={() => {
              console.log('🔘 Save Package button clicked!');
              console.log('📋 Form data:', packageForm);
              onSavePackage();
            }}
            startContent={<Plus className="h-5 w-5" />}
            isDisabled={!packageForm.name.trim()}
          >
            {editingPackage ? 'Update Package' : 'Create Package'}
          </Button>
        </div>
      </div>
    </div>
  </div>
);
};

export const renderLearningPackages = (handleSetActiveSection: (section: string) => void) => (
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
              onPress={() => handleSetActiveSection('all-packages')}
            >
              <div className="text-center">
                <PackageIcon className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-semibold">All Packages</span>
                <span className="text-xs opacity-80 block">View & manage packages</span>
              </div>
            </Button>
            
            <Button 
              className="h-24 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onPress={() => handleSetActiveSection('add-package')}
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