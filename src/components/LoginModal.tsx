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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

  useEffect(() => {
    if (isOpen) {
      setCsrfToken(Math.random().toString(36).substring(2, 15));
    }
  }, [isOpen]);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let text = '';
    let color = '';
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    switch (score) {
      case 0:
      case 1:
        text = 'Very Weak';
        color = 'text-red-500';
        break;
      case 2:
        text = 'Weak';
        color = 'text-orange-500';
        break;
      case 3:
        text = 'Fair';
        color = 'text-yellow-500';
        break;
      case 4:
        text = 'Good';
        color = 'text-blue-500';
        break;
      case 5:
        text = 'Strong';
        color = 'text-green-500';
        break;
    }
    
    return { score, text, color };
  };

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
        
        // Password strength validation
        if (sanitizedPassword.length < 6) {
          setError('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }
        
        // Name validation
        if (!sanitizedName.trim()) {
          setError('Full name is required');
          setIsLoading(false);
          return;
        }

        // Save new user to database
        try {
          const { vpsDataStore } = await import('../utils/vpsDataStore');
          
          // Check if user already exists
          const existingUsers = await vpsDataStore.getUsers();
          const userExists = existingUsers.some(u => u.email === sanitizedEmail);
          
          if (userExists) {
            setError('An account with this email already exists.');
            setIsLoading(false);
            return;
          }
          
          const newUser = {
            id: `user_${Date.now()}`,
            email: sanitizedEmail,
            password: sanitizedPassword,
            name: sanitizedName,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true,
            purchasedModules: [],
            totalSpent: 0
          };
          
          const success = await vpsDataStore.addUser(newUser);
          if (success) {
            setSuccess('Account created successfully! Logging you in...');
            setTimeout(() => {
              const { password: _, ...userWithoutPassword } = newUser;
              onLogin(userWithoutPassword);
              onClose();
              resetForm();
            }, 1500);
          } else {
            setError('Account creation failed. Please try a different email.');
          }
        } catch (error) {
          console.error('Registration error:', error);
          setError('Network error. Please check your connection and try again.');
        }
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
          setError('Invalid email or password.');
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
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 backdrop-blur-sm p-6 rounded-t-2xl border-b border-white/20">
          <div className="text-center">
            <div className="bg-gradient-to-r from-amber-700 to-orange-700 rounded-full p-3 w-fit mx-auto mb-4">
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
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
                  onChange={(e) => {
                    const newPassword = sanitizeInput(e.target.value);
                    setPassword(newPassword);
                    if (isRegisterMode && newPassword) {
                      setPasswordStrength(checkPasswordStrength(newPassword));
                    }
                  }}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
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
              {isRegisterMode && password && passwordStrength.text && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mali text-gray-600">Password strength:</span>
                    <span className={`text-xs font-mali font-bold ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 1 ? 'bg-red-500' :
                        passwordStrength.score === 2 ? 'bg-orange-500' :
                        passwordStrength.score === 3 ? 'bg-yellow-500' :
                        passwordStrength.score === 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {!isRegisterMode && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => alert('Please contact support for password reset.')}
                    className="text-xs text-amber-700 hover:text-orange-800 font-mali transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
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
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
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
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-3 px-6 rounded-xl hover:from-orange-700 hover:to-amber-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-mali text-sm shadow-lg"
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



          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-amber-700 hover:text-orange-800 font-bold text-sm transition-colors font-mali"
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