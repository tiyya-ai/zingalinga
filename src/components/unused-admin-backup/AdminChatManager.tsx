'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Clock, CheckCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  timestamp: Date;
  adminResponse?: string;
  adminResponseTime?: Date;
  status: 'new' | 'responded' | 'closed';
}

interface AdminChatManagerProps {
  user?: any;
}

export const AdminChatManager: React.FC<AdminChatManagerProps> = ({ user }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'user_123',
      userName: 'Sarah Johnson',
      userEmail: 'sarah@example.com',
      message: 'Hi, I\'m having trouble logging into my account. Can you help?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'new'
    },
    {
      id: '2',
      userId: 'user_456',
      userName: 'Mike Chen',
      userEmail: 'mike@example.com',
      message: 'My child can\'t access the videos we purchased. The videos show as locked.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      adminResponse: 'Hi Mike! I\'ve checked your account and refreshed your video access. Please try logging out and back in. The videos should now be available.',
      adminResponseTime: new Date(Date.now() - 20 * 60 * 1000),
      status: 'responded'
    },
    {
      id: '3',
      userId: 'user_789',
      userName: 'Emma Wilson',
      userEmail: 'emma@example.com',
      message: 'I need to update my payment method for the subscription. How can I do this?',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      status: 'new'
    }
  ]);

  const [selectedChat, setSelectedChat] = useState<ChatMessage | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'responded'>('all');

  const filteredMessages = chatMessages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  const handleSendResponse = () => {
    if (!selectedChat || !responseText.trim()) return;

    const updatedMessages = chatMessages.map(msg => 
      msg.id === selectedChat.id 
        ? {
            ...msg,
            adminResponse: responseText,
            adminResponseTime: new Date(),
            status: 'responded' as const
          }
        : msg
    );

    setChatMessages(updatedMessages);
    setSelectedChat({
      ...selectedChat,
      adminResponse: responseText,
      adminResponseTime: new Date(),
      status: 'responded'
    });
    setResponseText('');
  };

  const handleCloseChat = (chatId: string) => {
    const updatedMessages = chatMessages.map(msg => 
      msg.id === chatId 
        ? { ...msg, status: 'closed' as const }
        : msg
    );
    setChatMessages(updatedMessages);
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const newMessagesCount = chatMessages.filter(msg => msg.status === 'new').length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Chat Support Manager</h2>
              <p className="text-blue-100">Manage user support conversations</p>
            </div>
          </div>
          {newMessagesCount > 0 && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {newMessagesCount} New
            </div>
          )}
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Chat List */}
        <div className="w-1/2 border-r border-gray-200">
          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { key: 'all', label: 'All', count: chatMessages.length },
              { key: 'new', label: 'New', count: chatMessages.filter(m => m.status === 'new').length },
              { key: 'responded', label: 'Responded', count: chatMessages.filter(m => m.status === 'responded').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Messages List */}
          <div className="overflow-y-auto h-full">
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelectedChat(msg)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === msg.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{msg.userName}</div>
                      <div className="text-xs text-gray-500">{msg.userEmail}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(msg.status)}`}>
                    {msg.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{msg.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {msg.timestamp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Detail */}
        <div className="w-1/2 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedChat.userName}</h3>
                    <p className="text-sm text-gray-500">{selectedChat.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedChat.status)}`}>
                      {selectedChat.status}
                    </span>
                    {selectedChat.status !== 'closed' && (
                      <button
                        onClick={() => handleCloseChat(selectedChat.id)}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-sm transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {/* User Message */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3">
                        <p className="text-gray-800">{selectedChat.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedChat.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Response */}
                {selectedChat.adminResponse && (
                  <div className="mb-4">
                    <div className="flex items-start gap-3 justify-end">
                      <div className="flex-1 text-right">
                        <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm p-3 inline-block">
                          <p>{selectedChat.adminResponse}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Admin • {selectedChat.adminResponseTime?.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Input */}
              {selectedChat.status !== 'closed' && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendResponse()}
                      placeholder="Type your response..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSendResponse}
                      disabled={!responseText.trim()}
                      className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Quick Responses */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      'Thank you for contacting us!',
                      'I\'ve resolved the issue for you.',
                      'Please try logging out and back in.',
                      'I\'ve sent you an email with instructions.',
                      'Is there anything else I can help with?'
                    ].map(quickResponse => (
                      <button
                        key={quickResponse}
                        onClick={() => setResponseText(quickResponse)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                      >
                        {quickResponse}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};