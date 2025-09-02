// Static users for authentication
export const getStaticUsers = () => {
  try {
    return [
      {
        id: 'user-1',
        email: 'test@example.com',
        password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD || 'change-me-user',
        name: 'Test User',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'admin-1',
        email: 'admin@zingalinga.com',
        password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || 'change-me-admin',
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