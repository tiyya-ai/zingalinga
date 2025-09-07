export async function createOrder(packageId: string, amount: number, userInfo?: { email: string; name: string; userId?: string }) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId,
        amount,
        userEmail: userInfo?.email,
        userName: userInfo?.name,
        userId: userInfo?.userId
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Order creation failed:', error);
    return { success: false, error: 'Failed to create order' };
  }
}