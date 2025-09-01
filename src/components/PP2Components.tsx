import React from 'react';
import { Card, CardBody, CardHeader, Button, Input, Textarea, Select, SelectItem } from '@nextui-org/react';
import { Plus, Edit, BookOpen, X } from 'lucide-react';

export const renderPP2Program = (videos: any[], handleSetActiveSection: (section: string) => void) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">PP2 Program</h1>
        <div className="w-12 h-0.5 bg-gray-900"></div>
      </div>
      <div className="flex gap-2">
        <Button 
          className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => handleSetActiveSection('add-pp2-content')}
        >
          Add PP2 Content
        </Button>
      </div>
    </div>
    
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">PP2 Program Content ({videos.filter(v => v.category === 'PP2 Program').length})</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.filter(v => v.category === 'PP2 Program').map((program: any) => (
            <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">{program.title}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">PP2</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{program.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-semibold">${program.price}</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="light"
                    className="hover:bg-blue-50 transition-colors"
                    onPress={() => {
                      // Edit functionality will be handled by parent component
                    }}
                    aria-label={`Edit PP2 program ${program.title}`}
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {videos.filter(v => v.category === 'PP2 Program').length === 0 && (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No PP2 content yet</h3>
              <p className="text-gray-600 mb-4">Add your first PP2 program content to get started.</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  </div>
);

export const renderAddPP2Content = (
  pp2Form: any,
  setPP2Form: (form: any) => void,
  editingPP2: any,
  handleSavePP2: () => void,
  handleSetActiveSection: (section: string) => void,
  categories: string[]
) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {editingPP2 ? `Edit PP2 Content: ${editingPP2.title}` : 'Add New PP2 Content'}
        </h1>
        <div className="w-12 h-0.5 bg-gray-900"></div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="flat" 
          onPress={() => handleSetActiveSection('pp2-program')}
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          startContent={<X className="h-4 w-4" />}
        >
          Cancel
        </Button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">PP2 Content Details</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Title"
            value={pp2Form.title}
            onChange={(e) => setPP2Form({ ...pp2Form, title: e.target.value })}
            placeholder="Enter PP2 content title"
            required
          />
          
          <Textarea
            label="Description"
            value={pp2Form.description}
            onChange={(e) => setPP2Form({ ...pp2Form, description: e.target.value })}
            placeholder="Describe the PP2 content"
            rows={4}
          />
          
          <Input
            label="Price ($)"
            type="number"
            min="0"
            step="0.01"
            value={pp2Form.price?.toString() || '0'}
            onChange={(e) => setPP2Form({ ...pp2Form, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
          
          <Input
            label="Duration"
            value={pp2Form.duration}
            onChange={(e) => setPP2Form({ ...pp2Form, duration: e.target.value })}
            placeholder="e.g., 30 minutes"
          />
          
          <Input
            label="Content URL"
            value={pp2Form.contentUrl}
            onChange={(e) => setPP2Form({ ...pp2Form, contentUrl: e.target.value })}
            placeholder="https://example.com/content"
          />
          
          <Input
            label="Cover Image URL"
            value={pp2Form.coverImage}
            onChange={(e) => setPP2Form({ ...pp2Form, coverImage: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          
          <Input
            label="Tags"
            value={pp2Form.tags}
            onChange={(e) => setPP2Form({ ...pp2Form, tags: e.target.value })}
            placeholder="tag1, tag2, tag3"
          />
        </CardBody>
      </Card>

      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
        </CardHeader>
        <CardBody>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-semibold text-gray-900">{pp2Form.title || 'PP2 Content Title'}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">PP2</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">{pp2Form.description || 'Content description will appear here...'}</p>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-semibold">${pp2Form.price || 0}</span>
              <span className="text-gray-500 text-sm">{pp2Form.duration || 'Duration'}</span>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700"
            onPress={handleSavePP2}
            startContent={editingPP2 ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          >
            {editingPP2 ? 'Update PP2 Content' : 'Create PP2 Content'}
          </Button>
        </CardBody>
      </Card>
    </div>
  </div>
);