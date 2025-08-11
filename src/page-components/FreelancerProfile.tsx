import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Divider } from '@nextui-org/react';
import { User } from '../types';
import { MapPin, Phone, Mail, Calendar, Star, Award, Clock } from 'lucide-react';
import ProfileAvatar from '../components/ProfileAvatar';

interface FreelancerProfileProps {
  user: User;
  onClose?: () => void;
}

const FreelancerProfile: React.FC<FreelancerProfileProps> = ({ user, onClose }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="w-full">
        <CardHeader className="flex gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ProfileAvatar 
                  user={user}
                  size="lg"
                  showOnlineStatus={true}
                  className="border-4 border-white/30"
                />
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-blue-100">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip 
                      size="sm" 
                      color={user.role === 'admin' ? 'danger' : 'primary'} 
                      variant="flat"
                      className="bg-white/20 text-white"
                    >
                      {user.role === 'admin' ? 'Administrator' : 'Professional'}
                    </Chip>
                    {user.isOnline ? (
                      <Chip 
                        size="sm" 
                        color="success" 
                        variant="flat"
                        className="bg-green-500/20 text-green-100"
                        startContent={<div className="w-2 h-2 bg-green-400 rounded-full" />}
                      >
                        Online
                      </Chip>
                    ) : (
                      <Chip 
                        size="sm" 
                        color="default" 
                        variant="flat"
                        className="bg-gray-500/20 text-gray-100"
                        startContent={<Clock className="w-3 h-3" />}
                      >
                        {user.lastSeen || 'Offline'}
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
              {onClose && (
                <Button 
                  isIconOnly 
                  variant="light" 
                  onPress={onClose}
                  className="text-white hover:bg-white/20"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                {user.address && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{user.address}</span>
                    {user.city && <span>, {user.city}</span>}
                    {user.state && <span>, {user.state}</span>}
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                
                {user.lastLogin && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Professional Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Professional Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold text-green-600">
                    ${user.totalSpent?.toFixed(2) || '0.00'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Modules Purchased</span>
                  <span className="font-semibold text-blue-600">
                    {user.purchasedModules?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.8</span>
                    <span className="text-gray-500 text-sm">(127 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bio Section */}
          {user.bio && (
            <>
              <Divider className="my-6" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{user.bio}</p>
              </div>
            </>
          )}
          
          {/* Action Buttons */}
          <Divider className="my-6" />
          <div className="flex gap-3 justify-center">
            <Button 
              color="primary" 
              variant="solid"
              startContent={<Mail className="w-4 h-4" />}
            >
              Send Message
            </Button>
            <Button 
              color="secondary" 
              variant="bordered"
              startContent={<Phone className="w-4 h-4" />}
            >
              Call Now
            </Button>
            <Button 
              color="success" 
              variant="bordered"
              startContent={<Award className="w-4 h-4" />}
            >
              Hire Professional
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default FreelancerProfile;