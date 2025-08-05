'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

interface SupportStatus {
  isOnline: boolean;
  responseTime: string;
  agentsAvailable: number;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m here to help you with Zinga Linga. What can I assist you with today?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [supportStatus, setSupportStatus] = useState<SupportStatus>({
    isOnline: true,
    responseTime: '< 2 minutes',
    agentsAvailable: 3
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      const supportResponse = generateSupportResponse(newMessage);
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: supportResponse,
        sender: 'support',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateSupportResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('login') || message.includes('password') || message.includes('sign in')) {
      return 'For login issues:\n\n1. Try clearing your browser cache and cookies\n2. Use "Forgot Password" link if needed\n3. Check if Caps Lock is on\n4. Try a different browser\n\nStill having trouble? I can connect you with a live agent!';
    }
    
    if (message.includes('video') || message.includes('play') || message.includes('watch') || message.includes('streaming')) {
      return 'For video playback issues:\n\n1. Check your internet connection (need 5+ Mbps)\n2. Refresh the page\n3. Try a different browser\n4. Ensure you\'ve purchased the content\n5. Disable browser extensions\n\nWhich video are you trying to watch?';
    }
    
    if (message.includes('payment') || message.includes('purchase') || message.includes('buy') || message.includes('billing') || message.includes('card')) {
      return 'For payment issues:\n\n1. Verify your payment information\n2. Check if your card is expired\n3. Ensure sufficient funds\n4. Try a different payment method\n5. Contact your bank if declined\n\nYou can view purchase history in your profile. What specific payment issue are you experiencing?';
    }
    
    if (message.includes('profile') || message.includes('account') || message.includes('settings')) {
      return 'Account management:\n\n1. Click your avatar to edit profile\n2. Update name, phone, address\n3. Change profile picture\n4. Manage subscription\n5. View purchase history\n\nWhat would you like to change in your account?';
    }
    
    if (message.includes('child') || message.includes('age') || message.includes('learning') || message.includes('educational')) {
      return 'About Zinga Linga for kids:\n\n• Designed for ages 1-6 years\n• Adaptive learning content\n• Progress tracking available\n• Safe, ad-free environment\n• Parent dashboard included\n\nWhat age is your child? I can recommend specific content!';
    }
    
    if (message.includes('refund') || message.includes('cancel') || message.includes('subscription') || message.includes('money back')) {
      return 'Refund & Cancellation:\n\n• 14-day money-back guarantee\n• Cancel anytime from account settings\n• Refunds processed in 3-5 business days\n• Email billing@zingalinga.com\n• Keep access until period ends\n\nWhat would you like to cancel or refund?';
    }
    
    if (message.includes('technical') || message.includes('bug') || message.includes('error') || message.includes('not working')) {
      return 'Technical support steps:\n\n1. Refresh the page (Ctrl+F5)\n2. Clear browser cache\n3. Disable ad blockers\n4. Try incognito/private mode\n5. Update your browser\n\nWhat specific error are you seeing? I can escalate to our tech team if needed.';
    }
    
    if (message.includes('download') || message.includes('offline')) {
      return 'Download & Offline viewing:\n\n• Premium subscribers can download videos\n• Downloads expire after 30 days\n• Available on mobile apps only\n• Up to 10 videos at once\n\nDo you have a Premium subscription?';
    }
    
    if (message.includes('parent') || message.includes('control') || message.includes('safety')) {
      return 'Parental controls:\n\n• Set daily time limits\n• Content filtering by age\n• Progress monitoring\n• Safe browsing mode\n• PIN protection for settings\n\nAccess parent dashboard with PIN: 1234 (demo)';
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('help') || message === 'help') {
      return 'Hello! 👋 I\'m your Zinga Linga support assistant!\n\nI can help with:\n• Login & account issues\n• Video playback problems\n• Payment & billing\n• Technical support\n• Parental controls\n• Refunds & cancellations\n\nWhat can I help you with today?';
    }
    
    if (message.includes('live') || message.includes('human') || message.includes('agent') || message.includes('representative')) {
      return 'I\'d be happy to connect you with a live agent!\n\nOur support team is available:\n• Monday-Friday: 9 AM - 6 PM EST\n• Saturday: 10 AM - 4 PM EST\n• Sunday: Closed\n\nYou can also email us at support@zingalinga.com for 24/7 assistance.';
    }
    
    return 'Thank you for contacting Zinga Linga support! 🌟\n\nI\'m here to help with any questions. You can ask me about:\n• Account & login issues\n• Video playback\n• Payments & billing\n• Technical problems\n• Parental controls\n\nFor immediate assistance, email support@zingalinga.com or describe your issue in more detail.';
  };

  const quickActions = [
    'Login help',
    'Video not playing',
    'Payment issue',
    'Refund request',
    'Talk to human agent',
    'Parental controls'
  ];

  const handleQuickAction = (action: string) => {
    setNewMessage(action);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Zinga Linga Support</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  supportStatus.isOnline ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <p className="text-sm opacity-90">
                  {supportStatus.isOnline 
                    ? `Online • ${supportStatus.responseTime} response` 
                    : 'Offline • We\'ll email you back'
                  }
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`rounded-2xl p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};