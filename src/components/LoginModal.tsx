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
          const vpsModule = await import('../utils/vpsDataStore');
          const { vpsDataStore } = vpsModule;
          
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
            role: 'user' as const,
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
        const { getStaticUsers } = await import('../utils/staticUsers');
        const staticUsers = getStaticUsers();

        // Check static users first
        let user = staticUsers.find(u => u.email === sanitizedEmail && u.password === sanitizedPassword);
        console.log('Static user check:', { email: sanitizedEmail, found: !!user });
        
        // If not found in static users, check database users
        if (!user) {
          try {
            const { vpsDataStore } = await import('../utils/vpsDataStore');
            const data = await vpsDataStore.loadData();
            
            console.log('📊 VPS DATA CHECK:');
            console.log('- Total users in VPS:', data.users?.length || 0);
            console.log('- All user emails:', data.users?.map(u => u.email) || []);
            console.log('- Looking for email:', sanitizedEmail);
            
            const dbUser = (data.users || []).find(u => u.email === sanitizedEmail) as any;
            console.log('- User found:', !!dbUser);
            
            if (dbUser) {
              // Check if password matches exactly
              console.log('- Stored password:', dbUser.password);
              console.log('- Provided password:', sanitizedPassword);
              console.log('- Passwords match:', dbUser.password === sanitizedPassword);
              
              if (dbUser.password === sanitizedPassword) {
                user = {
                  ...dbUser,
                  lastLogin: new Date().toISOString(),
                  isActive: true,
                  purchasedModules: dbUser.purchasedModules || [],
                  totalSpent: dbUser.totalSpent || 0
                };
                console.log('✅ Login successful for VPS user');
              }
            } else {
              console.log('❌ User not found in VPS database');
            }
          } catch (error) {
            console.warn('Error checking database users:', error);
          }
        }
        
        if (user) {
          // Create proper session using auth manager
          try {
            const { authManager } = await import('../utils/auth');
            
            // Create session manually since we bypassed the auth manager login
            const sessionDuration = user.role === 'admin' ? 2 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 2h for admin, 8h for user
            const session = {
              user,
              token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
              expiresAt: Date.now() + sessionDuration,
              loginTime: Date.now(),
              lastActivity: Date.now(),
              userAgent: navigator.userAgent,
            };
            
            // Save session to localStorage
            localStorage.setItem('zinga-linga-session', JSON.stringify(session));
            console.log('💾 Session created for:', user.email, 'Role:', user.role);
            
            setSuccess('Welcome back! Redirecting...');
            setTimeout(() => {
              const { password: _, ...userWithoutPassword } = user;
              const completeUser = {
                ...userWithoutPassword,
                purchasedModules: (userWithoutPassword as any).purchasedModules || [],
                totalSpent: (userWithoutPassword as any).totalSpent || 0
              };
              onLogin(completeUser as UserType);
              onClose();
              resetForm();
              // Clear guest account info after successful login
              localStorage.removeItem('guestAccountEmail');
              localStorage.removeItem('guestAccountName');
              localStorage.removeItem('purchasedItems');
            }, 1000);
          } catch (error) {
            console.error('Error creating session:', error);
            setError('Login failed. Please try again.');
          }
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative transform hover:scale-105 transition-all duration-300">
        {/* Magical Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 opacity-70 rounded-3xl"></div>
        <div className="absolute inset-0 opacity-30 rounded-3xl bg-pink-100" style={{backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(244, 114, 182, 0.1) 2px, transparent 2px)', backgroundSize: '40px 40px'}}></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-pink-100 rounded-full transition-all duration-200 group hover:rotate-90"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:text-pink-600 transition-colors" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 backdrop-blur-sm p-6 rounded-t-3xl border-b border-white/20">
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-4 w-fit mx-auto mb-4 animate-bounce">
              {isRegisterMode ? (
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              ) : (
                <Heart className="w-8 h-8 text-white animate-pulse" />
              )}
            </div>
            <h2 className="text-2xl font-mali font-bold text-white mb-2 animate-fade-in">
              {isRegisterMode ? '🌟 Join Our Family!' : '🎉 Welcome Back!'}
            </h2>
            <p className="text-pink-100 font-mali text-sm">
              {isRegisterMode 
                ? 'Let\'s start your magical learning journey!' 
                : 'Ready for more fun adventures?'
              }
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative p-6">
          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl animate-shake">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">😅</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-mali font-bold">Oops! {error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl animate-bounce">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl animate-spin">🎉</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-mali font-bold">Yay! {success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="csrf_token" value={csrfToken} />
            {/* Name Field (Register only) */}
            {isRegisterMode && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-purple-700 font-mali flex items-center gap-2">
                  <span>👤</span> What's your name, superstar?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(sanitizeInput(e.target.value))}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 font-mali bg-purple-50 focus:bg-white hover:border-purple-300"
                    placeholder="Tell us your awesome name! 🌟"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-blue-700 font-mali flex items-center gap-2">
                <span>📧</span> {isRegisterMode ? 'Parent\'s email address' : 'Your email address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 font-mali bg-blue-50 focus:bg-white hover:border-blue-300"
                  placeholder={isRegisterMode ? "mom@example.com or dad@example.com 👨‍👩‍👧‍👦" : "your@email.com 💌"}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-green-700 font-mali flex items-center gap-2">
                <span>🔐</span> Secret password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-green-400" />
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
                  className="block w-full pl-10 pr-12 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 font-mali bg-green-50 focus:bg-white hover:border-green-300"
                  placeholder={isRegisterMode ? "Create a super strong password! 💪" : "Your secret password 🤫"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-green-400 hover:text-green-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-green-400 hover:text-green-600 transition-colors" />
                  )}
                </button>
              </div>
              {isRegisterMode && password && passwordStrength.text && (
                <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mali text-purple-600 flex items-center gap-1">
                      <span>💪</span> Password power:
                    </span>
                    <span className={`text-xs font-mali font-bold ${passwordStrength.color} flex items-center gap-1`}>
                      {passwordStrength.score <= 1 ? '😟' : 
                       passwordStrength.score === 2 ? '😐' :
                       passwordStrength.score === 3 ? '🙂' :
                       passwordStrength.score === 4 ? '😊' : '🤩'}
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        passwordStrength.score <= 1 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                        passwordStrength.score === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        passwordStrength.score === 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        passwordStrength.score === 4 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-green-400 to-green-500'
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
                    onClick={() => alert('Ask a grown-up to help you reset your password! 👨‍👩‍👧‍👦')}
                    className="text-xs text-purple-600 hover:text-purple-800 font-mali transition-colors hover:underline"
                  >
                    🤔 Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Confirm Password Field (Register only) */}
            {isRegisterMode && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-pink-700 font-mali flex items-center gap-2">
                  <span>🔒</span> Type your password again
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-pink-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(sanitizeInput(e.target.value))}
                    className="block w-full pl-10 pr-12 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 font-mali bg-pink-50 focus:bg-white hover:border-pink-300"
                    placeholder="Same password as above! ✨"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            )}



            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-mali text-lg shadow-xl hover:shadow-2xl animate-pulse hover:animate-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="animate-bounce">
                    {isRegisterMode ? '🌟 Creating your account...' : '🎉 Signing you in...'}
                  </span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isRegisterMode ? '🚀 Start My Adventure!' : '🎮 Let\'s Play!'}
                </span>
              )}
            </button>
          </form>



          {/* Mode Switch */}
          <div className="mt-6 text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
            <button
              onClick={switchMode}
              className="text-purple-700 hover:text-purple-900 font-bold text-sm transition-all duration-200 font-mali hover:scale-105 transform flex items-center justify-center gap-2 mx-auto"
            >
              {isRegisterMode 
                ? '👋 Already part of our family? Welcome back!' 
                : "🌟 New here? Join the fun!"
              }
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};