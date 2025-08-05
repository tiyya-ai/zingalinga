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
  Tabs,
  Tab,
  Divider
} from '@nextui-org/react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  MessageSquare,
  Copy,
  Send,
  Save,
  X
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms';
  status: 'active' | 'draft' | 'inactive';
  lastModified: string;
  variables: string[];
}

interface EmailTemplatesManagerProps {
  templates: EmailTemplate[];
  onTemplateUpdate: (templates: EmailTemplate[]) => void;
}

export default function EmailTemplatesManager({ templates, onTemplateUpdate }: EmailTemplatesManagerProps) {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(templates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'email' as 'email' | 'sms',
    status: 'active' as 'active' | 'draft' | 'inactive',
    variables: [] as string[]
  });

  const [previewData, setPreviewData] = useState({
    user_name: 'John Doe',
    user_email: 'john@example.com',
    product_name: 'Educational Video Pack',
    order_id: 'ORD-2024-001',
    total_amount: '$29.99',
    plan_name: 'Premium Plan',
    expiry_date: '2024-12-31',
    reset_link: 'https://app.zingalinga.com/reset-password',
    app_link: 'https://app.zingalinga.com'
  });

  useEffect(() => {
    setEmailTemplates(templates);
  }, [templates]);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setFormData({
      name: '',
      subject: '',
      content: '',
      type: 'email',
      status: 'active',
      variables: []
    });
    onModalOpen();
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      status: template.status,
      variables: template.variables
    });
    onModalOpen();
  };

  const handleDeleteTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    onDeleteOpen();
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    onPreviewOpen();
  };

  const handleSaveTemplate = () => {
    // Extract variables from content
    const variableMatches = formData.content.match(/\{\{([^}]+)\}\}/g) || [];
    const extractedVariables = variableMatches.map(match => match.replace(/[{}]/g, ''));

    const templateData: EmailTemplate = {
      id: isEditing ? selectedTemplate!.id : `template_${Date.now()}`,
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      type: formData.type,
      status: formData.status,
      lastModified: new Date().toISOString(),
      variables: extractedVariables
    };

    let updatedTemplates;
    if (isEditing) {
      updatedTemplates = emailTemplates.map(t => 
        t.id === selectedTemplate!.id ? templateData : t
      );
    } else {
      updatedTemplates = [...emailTemplates, templateData];
    }

    setEmailTemplates(updatedTemplates);
    onTemplateUpdate(updatedTemplates);
    onModalClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedTemplate) {
      const updatedTemplates = emailTemplates.filter(t => t.id !== selectedTemplate.id);
      setEmailTemplates(updatedTemplates);
      onTemplateUpdate(updatedTemplates);
      onDeleteClose();
    }
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicatedTemplate: EmailTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      lastModified: new Date().toISOString()
    };

    const updatedTemplates = [...emailTemplates, duplicatedTemplate];
    setEmailTemplates(updatedTemplates);
    onTemplateUpdate(updatedTemplates);
  };

  const renderPreviewContent = (content: string) => {
    if (!content) return '';
    let previewContent = content;
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      previewContent = previewContent.replace(regex, value);
    });
    return previewContent;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'inactive': return 'danger';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Email & SMS Templates</h1>
        <Button 
          color="primary" 
          startContent={<Plus className="h-4 w-4" />}
          onPress={handleCreateTemplate}
        >
          Create Template
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {emailTemplates.filter(t => t.type === 'email').length}
            </div>
            <div className="text-sm text-gray-600">Email Templates</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {emailTemplates.filter(t => t.type === 'sms').length}
            </div>
            <div className="text-sm text-gray-600">SMS Templates</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {emailTemplates.filter(t => t.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Templates</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {emailTemplates.filter(t => t.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Draft Templates</div>
          </CardBody>
        </Card>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Templates</h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <Table 
              aria-label="Email templates table"
              classNames={{
                wrapper: "min-h-[222px]",
                th: "bg-gray-50 text-gray-700 font-semibold",
                td: "border-b border-gray-200",
                table: "border border-gray-200 rounded-lg"
              }}
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>LAST MODIFIED</TableColumn>
                <TableColumn>VARIABLES</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No templates found">
                {emailTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-gray-500">{template.subject}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <span className="capitalize">{template.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip color={getStatusColor(template.status)} size="sm">
                        {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {new Date(template.lastModified).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(template.variables || []).slice(0, 3).map((variable) => (
                          <Chip key={variable} size="sm" variant="flat">
                            {variable}
                          </Chip>
                        ))}
                        {(template.variables || []).length > 3 && (
                          <Chip size="sm" variant="flat">
                            +{(template.variables || []).length - 3}
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="light" 
                          title="Preview"
                          onPress={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light" 
                          title="Edit"
                          onPress={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light" 
                          title="Duplicate"
                          onPress={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light" 
                          color="danger" 
                          title="Delete"
                          onPress={() => handleDeleteTemplate(template)}
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

      {/* Create/Edit Template Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="4xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Template Name"
                  placeholder="Enter template name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Select
                  label="Type"
                  selectedKeys={[formData.type]}
                  onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] as 'email' | 'sms' })}
                >
                  <SelectItem key="email" value="email">Email</SelectItem>
                  <SelectItem key="sms" value="sms">SMS</SelectItem>
                </Select>
              </div>

              {formData.type === 'email' && (
                <Input
                  label="Subject Line"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder={formData.type === 'email' ? 
                    "Enter email content. Use {{variable_name}} for dynamic content." :
                    "Enter SMS content. Use {{variable_name}} for dynamic content."
                  }
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  minRows={8}
                />
                <div className="text-xs text-gray-500">
                  Available variables: {`{{user_name}}, {{user_email}}, {{product_name}}, {{order_id}}, {{total_amount}}, {{plan_name}}, {{expiry_date}}, {{reset_link}}, {{app_link}}`}
                </div>
              </div>

              <Select
                label="Status"
                selectedKeys={[formData.status]}
                onSelectionChange={(keys) => setFormData({ ...formData, status: Array.from(keys)[0] as 'active' | 'draft' | 'inactive' })}
              >
                <SelectItem key="active" value="active">Active</SelectItem>
                <SelectItem key="draft" value="draft">Draft</SelectItem>
                <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
              </Select>

              {/* Preview Section */}
              {formData.content && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview</label>
                  <Card>
                    <CardBody>
                      <div className="space-y-2">
                        {formData.type === 'email' && formData.subject && (
                          <div>
                            <strong>Subject:</strong> {renderPreviewContent(formData.subject)}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">
                          {renderPreviewContent(formData.content)}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSaveTemplate}
              startContent={<Save className="h-4 w-4" />}
            >
              {isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="3xl">
        <ModalContent>
          <ModalHeader>
            Template Preview: {selectedTemplate?.name}
          </ModalHeader>
          <ModalBody>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedTemplate.type)}
                  <span className="font-medium capitalize">{selectedTemplate.type} Template</span>
                  <Chip color={getStatusColor(selectedTemplate.status)} size="sm">
                    {selectedTemplate.status}
                  </Chip>
                </div>
                
                <Divider />
                
                <Card>
                  <CardBody>
                    {selectedTemplate.type === 'email' && (
                      <div className="space-y-3">
                        <div>
                          <strong>Subject:</strong> {renderPreviewContent(selectedTemplate.subject)}
                        </div>
                        <Divider />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {renderPreviewContent(selectedTemplate.content)}
                    </div>
                  </CardBody>
                </Card>

                <div className="space-y-2">
                  <h4 className="font-medium">Variables Used:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTemplate.variables || []).map((variable) => (
                      <Chip key={variable} size="sm" variant="flat">
                        {variable}: {previewData[variable as keyof typeof previewData] || 'N/A'}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onPreviewClose}>
              Close
            </Button>
            <Button 
              color="primary" 
              onPress={() => {
                onPreviewClose();
                if (selectedTemplate) handleEditTemplate(selectedTemplate);
              }}
              startContent={<Edit className="h-4 w-4" />}
            >
              Edit Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete the template "{selectedTemplate?.name}"?</p>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={handleDeleteConfirm}
              startContent={<Trash2 className="h-4 w-4" />}
            >
              Delete Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}