import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { User } from '../types';
import { authManager } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authManager.login(email, password);
      
      if (result.success && result.user) {
        setSuccess('Login successful! Welcome back.');
        setTimeout(() => {
          onLogin(result.user!);
          onClose();
          setEmail('');
          setPassword('');
          setSuccess('');
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType: 'admin' | 'parent') => {
    const demoCredentials = {
      admin: { email: 'admin@zingalinga.com', password: 'Admin123!' },
      parent: { email: 'parent@demo.com', password: 'Parent123!' }
    };

    const { email: demoEmail, password: demoPassword } = demoCredentials[userType];
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    // Auto-submit after setting credentials
    setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await authManager.login(demoEmail, demoPassword);
        if (result.success && result.user) {
          setSuccess(`Demo ${userType} login successful!`);
          setTimeout(() => {
            onLogin(result.user!);
            onClose();
            setEmail('');
            setPassword('');
            setSuccess('');
          }, 1000);
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Demo login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-green to-brand-blue p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-mali font-bold mb-2">Welcome Back!</h2>
            <p className="text-white/90 font-mali">Sign in to access your learning dashboard</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-mali">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-mali">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent font-mali"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent font-mali"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white font-mali font-bold py-3 px-6 rounded-lg hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 font-mali mb-4">
              Try our demo accounts:
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-pink text-white font-mali font-bold py-2 px-4 rounded-lg hover:from-brand-red hover:to-brand-pink transform hover:scale-105 transition-all duration-200 disabled:opacity-50 text-sm"
              >
                <UserIcon className="w-4 h-4" />
                Admin Demo
              </button>
              
              <button
                onClick={() => handleDemoLogin('parent')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold py-2 px-4 rounded-lg hover:from-brand-yellow hover:to-brand-red transform hover:scale-105 transition-all duration-200 disabled:opacity-50 text-sm"
              >
                <UserIcon className="w-4 h-4" />
                Parent Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};