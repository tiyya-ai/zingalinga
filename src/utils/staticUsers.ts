// Static users for authentication
export const getStaticUsers = () => {
  try {
    return [
      {
        id: 'user-1',
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'admin-1',
        email: 'admin@zingalinga.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin' as const,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      }
    ];
  } catch (error) {
    console.error('Error creating static users:', error);
    return [];
  }
};