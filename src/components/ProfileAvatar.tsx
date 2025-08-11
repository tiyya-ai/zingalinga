import React, { useState } from 'react';
import { Avatar, Modal, ModalContent, useDisclosure } from '@nextui-org/react';
import { User } from '../types';
import FreelancerProfile from '../page-components/FreelancerProfile';

interface ProfileAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showOnlineStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  user,
  size = 'md',
  showOnlineStatus = true,
  onClick,
  className = ''
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  const onlineIndicatorSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: open profile modal
      onOpen();
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer transition-transform hover:scale-105 ${onClick ? 'hover:ring-2 hover:ring-blue-400' : ''}`}
        onClick={handleClick}
        title={`View ${user.name}'s profile`}
      >
        {user.avatar && user.avatar.trim() ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center" 
          style={{ display: user.avatar && user.avatar.trim() ? 'none' : 'flex' }}
        >
          <span className="text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <div 
            className={`${onlineIndicatorSizes[size]} rounded-full border-2 border-white ${
              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={user.isOnline ? 'Online' : `Last seen: ${user.lastSeen || 'Unknown'}`}
          >
          </div>
        </div>
      )}
      
      {/* Profile Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-transparent",
          backdrop: "bg-black/50"
        }}
      >
        <ModalContent className="bg-transparent shadow-none">
          <FreelancerProfile user={user} onClose={onClose} />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProfileAvatar;