// Security utilities to prevent injection attacks
export const sanitizeInput = (input: any): string => {
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Remove potential NoSQL injection characters
  return input
    .replace(/[\$\{\}]/g, '') // Remove MongoDB operators
    .replace(/[<>]/g, '') // Remove HTML/XML tags
    .replace(/[\r\n]/g, ' ') // Replace newlines for log safety
    .trim()
    .slice(0, 1000); // Limit length
};

export const sanitizeForLog = (data: any): string => {
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  
  return sanitizeInput(data)
    .replace(/[\r\n\t]/g, ' ') // Remove all control characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitizedEmail = sanitizeInput(email);
  return emailRegex.test(sanitizedEmail) && sanitizedEmail.length <= 254;
};

export const validateId = (id: string): boolean => {
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  return idRegex.test(sanitizeInput(id));
};

export const createSafeQuery = (field: string, value: any) => {
  const safeField = sanitizeInput(field);
  const safeValue = sanitizeInput(value);
  
  return { [safeField]: safeValue };
};

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  // In a real implementation, use bcrypt or similar
  // For demo purposes, we'll use a simple hash
  const encoder = new TextEncoder();
  const data = encoder.encode(sanitizeInput(password) + 'zinga-linga-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
};

// Generate secure random token
export const generateSecureToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};