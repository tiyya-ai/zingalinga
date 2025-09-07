import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { packageId, amount, userEmail, userName, userId } = await request.json();
    
    const orderData = {
      moduleId: packageId,
      amount: parseFloat(amount),
      status: userId ? 'completed' : 'pending',
      userId: userId || null,
      guestEmail: !userId ? userEmail : null,
      guestName: !userId ? userName : null,
    };
    
    const order = await prisma.purchase.create({
      data: orderData
    });
    
    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      status: order.status 
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create order' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (email) {
      where.OR = [
        { guestEmail: email },
        { user: { email: email } }
      ];
    }
    
    const orders = await prisma.purchase.findMany({
      where,
      include: {
        user: true,
        module: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}