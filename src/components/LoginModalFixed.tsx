import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Sparkles, Heart } from 'lucide-react';
import { User as UserType } from '../types';
import { sanitizeInput, sanitizeForLog, validateEmail } from '../utils/securityUtils';
import { authManager } from '../utils/authFixed';

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
        // Registration logic
        if (sanitizedPassword !== sanitizeInput(confirmPassword)) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const result = await authManager.register(sanitizedEmail, sanitizedPassword, sanitizedName);
        
        if (result.success) {
          setSuccess('Account created successfully! You can now log in.');
          setTimeout(() => {
            setIsRegisterMode(false);
            resetForm();
          }, 2000);
        } else {
          setError(result.message || 'Registration failed');
        }
      } else {
        // Login logic
        const result = await authManager.login(sanitizedEmail, sanitizedPassword);
        
        if (result.success && result.user) {
          setSuccess('Welcome back! Redirecting...');
          setTimeout(() => {
            onLogin(result.user!);
            onClose();
            resetForm();
          }, 1000);
        } else {
          setError(result.message || 'Login failed');
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-lg relative overflow-hidden transform transition-all duration-300 scale-100 border border-white/20 max-h-[95vh] overflow-y-auto">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 opacity-5">
          <div className="absolute inset-0 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-green-300 to-blue-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 sm:p-10 text-white">
          <div className="text-center">
            <div className="bg-amber-800/30 rounded-full p-5 w-fit mx-auto mb-6 backdrop-blur-sm shadow-lg">
              {isRegisterMode ? (
                <User className="w-10 h-10" />
              ) : (
                <Sparkles className="w-10 h-10" />
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 font-mali">
              {isRegisterMode ? 'Join Zinga Linga!' : 'Welcome Back!'}
            </h2>
            <p className="text-white/95 font-mali text-base sm:text-xl">
              {isRegisterMode 
                ? 'Start your magical learning journey with Kiki & Tano' 
                : 'Continue your adventure with Kiki & Tano'
              }
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative p-6 sm:p-10">
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
                  onChange={(e) => setPassword(sanitizeInput(e.target.value))}
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
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-700 hover:to-amber-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-mali text-lg shadow-lg"
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