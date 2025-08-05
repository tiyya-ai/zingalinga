import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Sparkles, Heart } from 'lucide-react';
import { User as UserType } from '../types';
import { sanitizeInput, sanitizeForLog, validateEmail } from '../utils/securityUtils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCsrfToken(Math.random().toString(36).substring(2, 15));
      
      // Auto-fill email for guest users
      const guestEmail = localStorage.getItem('guestAccountEmail');
      const guestName = localStorage.getItem('guestAccountName');
      if (guestEmail) {
        setEmail(guestEmail);
        if (guestName) {
          setName(guestName);
        }
      }
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = () => {
    setIsRegisterMode(!isRegisterMode);
    resetForm();
  };

  const handleDirectLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simple client-side authentication for static deployment
      const users = [
        {
          id: 'admin-1',
          email: 'admin@zingalinga.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        },
        {
          id: 'user-1',
          email: 'test@example.com',
          password: 'test123',
          name: 'Test User',
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        }
      ];

      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        setSuccess('Welcome! Redirecting...');
        setTimeout(() => {
          const { password: _, ...userWithoutPassword } = user;
          onLogin(userWithoutPassword);
          onClose();
          resetForm();
          // Clear guest account info after successful login
          localStorage.removeItem('guestAccountEmail');
          localStorage.removeItem('guestAccountName');
          localStorage.removeItem('purchasedItems');
        }, 1000);
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Direct login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);
      const sanitizedName = sanitizeInput(name);
      
      if (!validateEmail(sanitizedEmail)) {
        setError('Invalid email format');
        setIsLoading(false);
        return;
      }

      if (isRegisterMode) {
        // Registration logic - client-side for static deployment
        if (sanitizedPassword !== sanitizeInput(confirmPassword)) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        // Simple client-side registration
        setSuccess('Account created successfully! You can now log in.');
        setTimeout(() => {
          setIsRegisterMode(false);
          resetForm();
        }, 2000);
      } else {
        // Login logic - check both static users and database users
        const staticUsers = [
          {
            id: 'admin-1',
            email: 'admin@zingalinga.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true
          },
          {
            id: 'user-1',
            email: 'test@example.com',
            password: 'test123',
            name: 'Test User',
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true
          }
        ];

        // Check static users first
        let user = staticUsers.find(u => u.email === sanitizedEmail && u.password === sanitizedPassword);
        
        // If not found in static users, check database for guest accounts
        if (!user) {
          try {
            const { vpsDataStore } = await import('../utils/vpsDataStore');
            const data = await vpsDataStore.loadData();
            const dbUser = (data.users || []).find(u => u.email === sanitizedEmail);
            
            if (dbUser) {
              // For guest accounts, we'll use a simple password (email without @domain)
              const simplePassword = sanitizedEmail.split('@')[0];
              if (sanitizedPassword === simplePassword || sanitizedPassword === 'guest123') {
                user = {
                  ...dbUser,
                  password: sanitizedPassword,
                  lastLogin: new Date().toISOString(),
                  isActive: true
                };
              }
            }
          } catch (error) {
            console.warn('Error checking database users:', error);
          }
        }
        
        if (user) {
          setSuccess('Welcome back! Redirecting...');
          setTimeout(() => {
            const { password: _, ...userWithoutPassword } = user;
            onLogin(userWithoutPassword);
            onClose();
            resetForm();
            // Clear guest account info after successful login
            localStorage.removeItem('guestAccountEmail');
            localStorage.removeItem('guestAccountName');
            localStorage.removeItem('purchasedItems');
          }, 1000);
        } else {
          setError('Invalid email or password. For guest accounts, try password "guest123"');
        }
      }
    } catch (error) {
      console.error('Authentication error:', sanitizeForLog(error));
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed. Please check your credentials and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 rounded-2xl"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-brand-green to-brand-blue backdrop-blur-sm p-6 rounded-t-2xl border-b border-white/20">
          <div className="text-center">
            <div className="bg-gradient-to-r from-brand-green to-brand-blue rounded-full p-3 w-fit mx-auto mb-4">
              {isRegisterMode ? (
                <User className="w-6 h-6 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-white" />
              )}
            </div>
            <h2 className="text-xl font-mali font-bold text-white mb-2">
              {isRegisterMode ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-gray-300 font-mali text-sm">
              {isRegisterMode 
                ? 'Join the Zinga Linga family' 
                : localStorage.getItem('guestAccountEmail') 
                  ? '🎬 Login to watch your purchased videos'
                  : 'Welcome back to your adventure'
              }
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative p-6">
          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-mali">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-mali">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="csrf_token" value={csrfToken} />
            {/* Name Field (Register only) */}
            {isRegisterMode && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 font-mali">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(sanitizeInput(e.target.value))}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 font-mali">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 font-mali">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register only) */}
            {isRegisterMode && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 font-mali">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(sanitizeInput(e.target.value))}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white font-bold py-3 px-6 rounded-xl hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-mali text-sm shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isRegisterMode ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Direct Login Buttons */}
          {!isRegisterMode && (
            <div className="mt-6 space-y-3">
              {localStorage.getItem('guestAccountEmail') ? (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-green-800 font-mali mb-2">🎉 Welcome Back!</h4>
                    <p className="text-sm text-green-700 font-mali mb-3">
                      Your account: <strong>{localStorage.getItem('guestAccountEmail')}</strong><br/>
                      Password: <span className="bg-green-200 px-2 py-1 rounded font-mono">guest123</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const guestEmail = localStorage.getItem('guestAccountEmail');
                      if (guestEmail) {
                        handleDirectLogin(guestEmail, 'guest123');
                      }
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-4 rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-mali text-base shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    🚀 Watch My Videos Now
                  </button>
                  <p className="text-xs text-gray-500 font-mali mt-2">
                    One-click access to your purchased content
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-mali mb-3">Demo Accounts</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDirectLogin('admin@zingalinga.com', 'admin123')}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-mali text-sm shadow-lg"
                    >
                      <User className="w-4 h-4" />
                      Admin Demo
                    </button>
                    <button
                      onClick={() => handleDirectLogin('test@example.com', 'test123')}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-mali text-sm shadow-lg"
                    >
                      <Heart className="w-4 h-4" />
                      User Demo
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 font-mali">
                      💡 <strong>Purchased videos?</strong> Use your email + password "guest123"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-purple-600 hover:text-purple-800 font-bold text-sm transition-colors font-mali"
            >
              {isRegisterMode 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Create One"
              }
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};