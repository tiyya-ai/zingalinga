import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        user: true,
        module: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const purchaseData = await request.json();
    console.log('Creating purchase with Prisma:', purchaseData);
    
    const purchase = await prisma.purchase.create({
      data: {
        userId: purchaseData.userId,
        moduleId: purchaseData.moduleId,
        amount: parseFloat(purchaseData.amount) || 0.00,
        status: purchaseData.status || 'completed'
      },
      include: {
        user: true,
        module: true
      }
    });
    
    console.log('Purchase created successfully:', purchase);
    return NextResponse.json(purchase);
    
  } catch (error) {
    console.error('Error creating purchase:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create purchase', 
      details: errorMessage 
    }, { status: 500 });
  }
}