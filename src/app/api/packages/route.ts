import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(packages.map(pkg => ({
      ...pkg,
      contentIds: typeof pkg.contentIds === 'string' ? JSON.parse(pkg.contentIds) : pkg.contentIds
    })));
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const packageData = await request.json();
    console.log('Creating package with Prisma:', packageData);
    
    const newPackage = await prisma.package.create({
      data: {
        name: packageData.name,
        description: packageData.description || null,
        price: parseFloat(packageData.price) || 0.00,
        type: packageData.type || 'subscription',
        isActive: packageData.isActive !== undefined ? packageData.isActive : true,
        isPopular: packageData.isPopular || false,
        features: packageData.features || null,
        coverImage: packageData.coverImage || null,
        contentIds: packageData.contentIds || []
      }
    });
    
    console.log('Package created successfully:', newPackage);
    return NextResponse.json(newPackage);
    
  } catch (error) {
    console.error('Error creating package:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create package', 
      details: errorMessage 
    }, { status: 500 });
  }
}