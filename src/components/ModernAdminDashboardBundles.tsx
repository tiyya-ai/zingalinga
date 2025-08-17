// Bundle Management Functions for ModernAdminDashboard
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
  Switch,
  Checkbox,
  CheckboxGroup
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
  Layers
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

export const renderAllBundles = (
  bundles: any[], 
  onDeleteBundle: (id: string) => void, 
  formatCurrency: (amount: number) => string,
  setActiveSection: (section: string) => void,
  onEditBundle?: (bundle: any) => void,
  onPreviewBundle?: (bundle: any) => void
) => (
  <div className="space-y-6">
    <PageHeader 
      title="Content Bundles" 
      actions={
        <Button 
          className="bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => setActiveSection('add-bundle')}
        >
          Add New Bundle
        </Button>
      }
    />
    
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Content Bundles ({bundles.length})</h3>
      </CardHeader>
      <CardBody className="p-0">
        <Table removeWrapper aria-label="Bundles table">
          <TableHeader>
            <TableColumn>BUNDLE</TableColumn>
            <TableColumn>CONTENT COUNT</TableColumn>
            <TableColumn>PRICE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No bundles found">
            {bundles.map((bundle) => (
              <TableRow key={bundle.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      {bundle.icon ? (
                        <span className="text-2xl">{bundle.icon}</span>
                      ) : (
                        <Layers className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{bundle.name}</p>
                      <p className="text-sm text-gray-500">{bundle.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" className="bg-blue-100 text-blue-700">
                    {bundle.contentIds?.length || 0} items
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-900">{formatCurrency(bundle.price)}</span>
                </TableCell>
                <TableCell>
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    className={bundle.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                  >
                    {bundle.isActive ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {onPreviewBundle && (
                      <Button
                        size="sm"
                        variant="flat"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 min-w-unit-8 w-8 h-8 p-0"
                        onPress={() => onPreviewBundle(bundle)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEditBundle && (
                      <Button
                        size="sm"
                        variant="flat"
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 min-w-unit-8 w-8 h-8 p-0"
                        onPress={() => onEditBundle(bundle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-red-100 text-red-700 hover:bg-red-200 min-w-unit-8 w-8 h-8 p-0"
                      onPress={() => onDeleteBundle(bundle.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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

export const renderAddBundle = (
  bundleForm: any, 
  setBundleForm: (form: any) => void, 
  onSaveBundle: () => void,
  setActiveSection: (section: string) => void,
  editingBundle?: any,
  availableContent?: any[]
) => {
  console.log('🎯 renderAddBundle called with onSaveBundle:', typeof onSaveBundle);
  console.log('📝 Current bundleForm:', bundleForm);
  
  return (
  <div className="space-y-6">
    <PageHeader 
      title={editingBundle ? "Edit Bundle" : "Add New Bundle"} 
      actions={
        <Button 
          variant="flat" 
          onPress={() => setActiveSection('all-bundles')}
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
            <h3 className="text-lg font-semibold text-gray-900">Bundle Information</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bundle Name *</label>
              <Input
                value={bundleForm.name}
                onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                placeholder="Enter bundle name"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={bundleForm.description}
                onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                placeholder="Describe the bundle"
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
                  value={bundleForm.price.toString()}
                  onChange={(e) => setBundleForm({ ...bundleForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Icon</label>
                <Input
                  value={bundleForm.icon}
                  onChange={(e) => setBundleForm({ ...bundleForm, icon: e.target.value })}
                  placeholder="📦"
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                  }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Content Selection */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bundle Content</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Content Items *</label>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                <CheckboxGroup
                  value={bundleForm.contentIds || []}
                  onValueChange={(value) => setBundleForm({ ...bundleForm, contentIds: value })}
                  className="space-y-2"
                >
                  {availableContent?.map((content) => (
                    <Checkbox key={content.id} value={content.id} className="w-full">
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{content.type?.charAt(0) || 'C'}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{content.title || content.name}</p>
                          <p className="text-sm text-gray-500">{content.description}</p>
                        </div>
                      </div>
                    </Checkbox>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No content available</p>
                  )}
                </CheckboxGroup>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Preview & Settings */}
      <div className="space-y-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bundle Settings</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Active Status</p>
                <p className="text-sm text-gray-500">Make bundle available for purchase</p>
              </div>
              <Switch
                isSelected={bundleForm.isActive}
                onValueChange={(checked) => setBundleForm({ ...bundleForm, isActive: checked })}
                classNames={{
                  wrapper: "group-data-[selected=true]:bg-purple-600"
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Featured Bundle</p>
                <p className="text-sm text-gray-500">Highlight this bundle</p>
              </div>
              <Switch
                isSelected={bundleForm.isFeatured}
                onValueChange={(checked) => setBundleForm({ ...bundleForm, isFeatured: checked })}
                classNames={{
                  wrapper: "group-data-[selected=true]:bg-purple-600"
                }}
              />
            </div>
          </CardBody>
        </Card>
        
        {/* Bundle Preview */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bundle Preview</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  {bundleForm.icon ? (
                    <span className="text-2xl">{bundleForm.icon}</span>
                  ) : (
                    <Layers className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{bundleForm.name || 'Bundle Name'}</p>
                  <p className="text-sm text-gray-500">{bundleForm.contentIds?.length || 0} items</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{bundleForm.description || 'Bundle description...'}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-lg text-purple-600">${bundleForm.price || 0}</span>
                <Chip size="sm" variant="flat" className={bundleForm.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                  {bundleForm.isActive ? "Active" : "Inactive"}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Save Button */}
        <Button 
          className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          size="lg"
          onPress={onSaveBundle}
          isDisabled={!bundleForm.name || !bundleForm.price || !bundleForm.contentIds?.length}
        >
          {editingBundle ? 'Update Bundle' : 'Create Bundle'}
        </Button>
      </div>
    </div>
  </div>
  );
};