import { User } from '../types';

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
  loginTime: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
}

class AuthManager {
  private sessionKey = 'zinga-linga-session';
  private attemptsKey = 'zinga-linga-login-attempts';
  private maxLoginAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
  private adminSessionDuration = 2 * 60 * 60 * 1000; // 2 hours for admin

  // Demo users for client-side authentication
  private demoUsers: any[] = [
    {
      id: 'admin-1',
      email: 'admin@zinga-linga.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin' as 'user' | 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      totalSpent: 0,
      purchasedModules: []
    },
    {
      id: 'user-1',
      email: 'user@example.com',
      password: 'user123',
      name: 'Test User',
      role: 'user' as 'user' | 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      totalSpent: 0,
      purchasedModules: []
    }
  ];

  // Generate secure token
  private generateToken(): string {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get current session
  getCurrentSession(): AuthSession | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const sessionData = localStorage.getItem(this.sessionKey);
      if (!sessionData) return null;

      const session: AuthSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      // Update last activity
      session.lastActivity = Date.now();
      localStorage.setItem(this.sessionKey, JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Check if user is locked out
  private isLockedOut(email: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const attemptsData = localStorage.getItem(this.attemptsKey);
      if (!attemptsData) return false;

      const attempts: LoginAttempt[] = JSON.parse(attemptsData);
      const recentAttempts = attempts.filter(
        attempt => 
          attempt.email === email && 
          !attempt.success &&
          Date.now() - attempt.timestamp < this.lockoutDuration
      );

      return recentAttempts.length >= this.maxLoginAttempts;
    } catch (error) {
      console.error('Error checking lockout:', error);
      return false;
    }
  }

  // Record login attempt
  private recordLoginAttempt(email: string, success: boolean): void {
    try {
      if (typeof window === 'undefined') return;
      
      const attemptsData = localStorage.getItem(this.attemptsKey);
      const attempts: LoginAttempt[] = attemptsData ? JSON.parse(attemptsData) : [];

      const attempt: LoginAttempt = {
        email,
        timestamp: Date.now(),
        success,
        ipAddress: 'localhost',
      };

      attempts.push(attempt);

      // Keep only last 100 attempts
      if (attempts.length > 100) {
        attempts.splice(0, attempts.length - 100);
      }

      localStorage.setItem(this.attemptsKey, JSON.stringify(attempts));
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  // Login with enhanced security and fallback
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message: string; session?: AuthSession }> {
    try {
      // Check if user is locked out
      if (this.isLockedOut(email)) {
        return {
          success: false,
          message: `Account locked due to too many failed attempts. Try again in ${Math.ceil(this.lockoutDuration / 60000)} minutes.`
        };
      }

      let result: any;
      let user: User | null = null;

      try {
        // Try to authenticate with API first
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const responseText = await response.text();
          
          // Check if response is HTML (404 page) instead of JSON
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            throw new Error('API endpoint not found - received HTML instead of JSON');
          }
          
          try {
            result = JSON.parse(responseText);
            if (result.success) {
              user = result.user;
            }
          } catch (parseError) {
            throw new Error('Invalid JSON response from API');
          }
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (apiError) {
        // Fallback to client-side authentication for static deployment
        console.log('API not available, using client-side authentication:', apiError);
        
        const foundUser = this.demoUsers.find(u => u.email === email && u.password === password);
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          user = userWithoutPassword as User;
          result = { success: true, user };
        } else {
          result = { success: false, error: 'Invalid email or password' };
        }
      }

      if (!result.success || !user) {
        this.recordLoginAttempt(email, false);
        return { success: false, message: result.error || 'Invalid email or password' };
      }

      // Check user status
      if (user.status === 'suspended') {
        this.recordLoginAttempt(email, false);
        return { success: false, message: 'Your account has been suspended. Please contact support for assistance.' };
      }
      
      if (user.status === 'inactive') {
        this.recordLoginAttempt(email, false);
        return { success: false, message: 'Your account is inactive. Please contact support to reactivate your account.' };
      }

      // Create session
      const sessionDuration = user.role === 'admin' ? this.adminSessionDuration : this.sessionDuration;
      const session: AuthSession = {
        user,
        token: this.generateToken(),
        expiresAt: Date.now() + sessionDuration,
        loginTime: Date.now(),
        lastActivity: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      };

      // Save session
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
      }

      // Record successful login
      this.recordLoginAttempt(email, true);

      return { success: true, user, message: 'Login successful', session };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }

  // Register new user
  async register(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      // Validate name
      if (!name || name.trim().length < 2) {
        return { success: false, message: 'Name must be at least 2 characters long' };
      }

      let result: any;
      let user: User | null = null;

      try {
        // Try to register with API first
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name: name.trim() })
        });

        if (response.ok) {
          const responseText = await response.text();
          
          // Check if response is HTML (404 page) instead of JSON
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            throw new Error('API endpoint not found - received HTML instead of JSON');
          }
          
          try {
            result = JSON.parse(responseText);
            if (result.success) {
              user = result.user;
            }
          } catch (parseError) {
            throw new Error('Invalid JSON response from API');
          }
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (apiError) {
        // Fallback to client-side registration for static deployment
        console.log('API not available, using client-side registration:', apiError);
        
        // Check if user already exists
        const existingUser = this.demoUsers.find(u => u.email === email);
        if (existingUser) {
          return { success: false, message: 'User with this email already exists' };
        }

        // Create new user
        const newUser = {
          id: `user-${Date.now()}`,
          email,
          password,
          name: name.trim(),
          role: 'user' as 'user' | 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          totalSpent: 0,
          purchasedModules: []
        };

        // Add to demo users (in memory only)
        this.demoUsers.push(newUser);

        const { password: _, ...userWithoutPassword } = newUser;
        user = userWithoutPassword as User;
        result = { success: true, user };
      }

      if (!result.success || !user) {
        return { success: false, message: result.error || 'Registration failed' };
      }

      return { success: true, user, message: 'Registration successful! You can now log in.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  }

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.sessionKey);
    }
  }

  // Check admin privileges
  isAdmin(session: AuthSession | null): boolean {
    return session?.user?.role === 'admin';
  }

  // Check if session is still valid
  isSessionValid(session: AuthSession | null): boolean {
    if (!session) return false;
    return Date.now() < session.expiresAt;
  }

  // Get login attempts for admin view
  getLoginAttempts(): LoginAttempt[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const attemptsData = localStorage.getItem(this.attemptsKey);
      return attemptsData ? JSON.parse(attemptsData) : [];
    } catch (error) {
      console.error('Error getting login attempts:', error);
      return [];
    }
  }

  // Clear login attempts (admin function)
  clearLoginAttempts(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.attemptsKey);
    }
  }
}

export const authManager = new AuthManager();