import React from 'react';
import { Card, CardBody, CardHeader, Button, Input, Textarea, Select, SelectItem } from '@nextui-org/react';
import { Plus, Edit, BookOpen, X, DollarSign, Upload, Clock, FileText, Video, Headphones, Target, Award } from 'lucide-react';

export const renderPP2Program = (videos: any[], handleSetActiveSection: (section: string) => void) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">PP2 Program (Intermediate Level)</h1>
        <p className="text-gray-600">Advanced learning program for intermediate learners</p>
        <div className="w-12 h-0.5 bg-gray-900"></div>
      </div>
      <div className="flex gap-2">
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.filter(v => v.category === 'PP2 Program').map((program: any) => (
            <Card key={program.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardBody className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{program.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">PP2</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{program.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{program.duration || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{program.contentType || 'Content'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-semibold text-lg">${program.price}</span>
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
              </CardBody>
            </Card>
          ))}
          {videos.filter(v => v.category === 'PP2 Program').length === 0 && (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No PP2 content yet</h3>
              <p className="text-gray-600 mb-4">Add your first PP2 program content to get started.</p>
              <Button
                color="primary"
                onPress={() => handleSetActiveSection('add-pp2-content')}
                startContent={<Plus className="h-4 w-4" />}
              >
                Add First Content
              </Button>
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
) => {
  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, WebP)');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setPP2Form(prev => ({ ...prev, coverImage: imageUrl }));
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'interactive': return <Target className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {editingPP2 ? `Edit PP2 Content: ${editingPP2.title}` : 'Add New PP2 Content'}
          </h1>
          <p className="text-gray-600">Create intermediate level learning content</p>
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
        {/* Left Column - Content Information */}
        <div className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Content Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input
                  value={pp2Form.title}
                  onChange={(e) => setPP2Form({ ...pp2Form, title: e.target.value })}
                  placeholder="Enter PP2 content title"
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description (HTML supported)</label>
                <textarea
                  value={pp2Form.description}
                  onChange={(e) => setPP2Form({ ...pp2Form, description: e.target.value })}
                  placeholder="Describe the PP2 content. You can use HTML tags like <b>bold</b>, <i>italic</i>, <br> for line breaks, <p>paragraphs</p>, etc."
                  rows={6}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 resize-none font-mono text-sm"
                />
                <div className="text-xs text-gray-500">
                  HTML tags supported: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Price *</label>
                  <Input
                    type="number"
                    value={pp2Form.price?.toString() || '0'}
                    onChange={(e) => setPP2Form({ ...pp2Form, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Content Type</label>
                  <Select
                    selectedKeys={[pp2Form.contentType || 'text']}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setPP2Form({ ...pp2Form, contentType: selected });
                    }}
                    classNames={{
                      trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500"
                    }}
                  >
                    <SelectItem key="text" value="text">Text Content</SelectItem>
                    <SelectItem key="video" value="video">Video</SelectItem>
                    <SelectItem key="audio" value="audio">Audio</SelectItem>
                    <SelectItem key="interactive" value="interactive">Interactive</SelectItem>
                    <SelectItem key="quiz" value="quiz">Quiz</SelectItem>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <Input
                    value={pp2Form.duration}
                    onChange={(e) => setPP2Form({ ...pp2Form, duration: e.target.value })}
                    placeholder="e.g., 45 minutes"
                    startContent={<Clock className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                  <Select
                    selectedKeys={[pp2Form.difficulty || 'intermediate']}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setPP2Form({ ...pp2Form, difficulty: selected });
                    }}
                    classNames={{
                      trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500"
                    }}
                  >
                    <SelectItem key="intermediate" value="intermediate">Intermediate</SelectItem>
                    <SelectItem key="advanced" value="advanced">Advanced</SelectItem>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Content URL</label>
                <Input
                  value={pp2Form.contentUrl}
                  onChange={(e) => setPP2Form({ ...pp2Form, contentUrl: e.target.value })}
                  placeholder="https://example.com/content"
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Learning Objectives</label>
                <textarea
                  value={pp2Form.objectives || ''}
                  onChange={(e) => setPP2Form({ ...pp2Form, objectives: e.target.value })}
                  placeholder="What will students learn? (comma separated)"
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 resize-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Prerequisites</label>
                <textarea
                  value={pp2Form.prerequisites || ''}
                  onChange={(e) => setPP2Form({ ...pp2Form, prerequisites: e.target.value })}
                  placeholder="Required knowledge or completed lessons (comma separated)"
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 resize-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <Input
                  value={pp2Form.tags}
                  onChange={(e) => setPP2Form({ ...pp2Form, tags: e.target.value })}
                  placeholder="intermediate, advanced, skill-building"
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>
            </CardBody>
          </Card>

          {/* Cover Image Upload */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cover Image</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all duration-300 bg-blue-50/30">
                {pp2Form.coverImage ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto shadow-lg">
                      <img 
                        src={pp2Form.coverImage || undefined} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cover image ready</p>
                      <p className="text-xs text-gray-500">Click to change image</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="flat" 
                      color="warning"
                      onPress={() => setPP2Form({ ...pp2Form, coverImage: '' })}
                      startContent={<X className="h-4 w-4" />}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <BookOpen className="h-12 w-12 text-blue-500 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Upload cover image</p>
                      <p className="text-xs text-gray-500">Recommended: 1280x720 pixels - JPG, PNG, WebP</p>
                    </div>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white" 
                      variant="flat"
                      startContent={<Upload className="h-4 w-4" />}
                      onPress={() => {
                        const fileInput = document.getElementById('pp2-cover-input') as HTMLInputElement;
                        fileInput?.click();
                      }}
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
                <input
                  id="pp2-cover-input"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Or paste image URL</label>
                <Input
                  value={pp2Form.coverImage}
                  onChange={(e) => setPP2Form({ ...pp2Form, coverImage: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* Cover Image Preview */}
                {pp2Form.coverImage && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={pp2Form.coverImage} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content Card Preview */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getContentTypeIcon(pp2Form.contentType || 'text')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{pp2Form.title || 'PP2 Content Title'}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">PP2 - {pp2Form.difficulty || 'Intermediate'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 text-sm">{pp2Form.description || 'Content description will appear here...'}</p>
                    
                    {pp2Form.objectives && (
                      <div className="text-xs text-gray-500">
                        <strong>Objectives:</strong> {pp2Form.objectives}
                      </div>
                    )}
                    
                    {pp2Form.prerequisites && (
                      <div className="text-xs text-gray-500">
                        <strong>Prerequisites:</strong> {pp2Form.prerequisites}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 font-semibold text-lg">${pp2Form.price || 0}</span>
                      {pp2Form.duration && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{pp2Form.duration}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {pp2Form.contentType || 'Text'} Content
                    </div>
                  </div>
                </div>

                {/* Tags Preview */}
                {pp2Form.tags && (
                  <div className="flex flex-wrap gap-2">
                    {pp2Form.tags.split(',').map((tag: string, index: number) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full mt-6 bg-blue-600 text-white hover:bg-blue-700"
                onPress={handleSavePP2}
                startContent={editingPP2 ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                isDisabled={!pp2Form.title?.trim()}
              >
                {editingPP2 ? 'Update PP2 Content' : 'Create PP2 Content'}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};