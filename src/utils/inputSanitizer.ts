// Input sanitization utility
export const sanitizeInput = {
  text: (input: string): string => {
    return input.replace(/[<>\"'&]/g, '').trim();
  },
  
  email: (input: string): string => {
    return input.toLowerCase().trim();
  },
  
  number: (input: number | string): number => {
    return Math.max(0, Number(input) || 0);
  },
  
  role: (input: string): string => {
    const validRoles = ['user', 'admin', 'moderator'];
    return validRoles.includes(input) ? input : 'user';
  },
  
  status: (input: string): string => {
    const validStatuses = ['active', 'inactive'];
    return validStatuses.includes(input) ? input : 'active';
  },
  
  validateEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};