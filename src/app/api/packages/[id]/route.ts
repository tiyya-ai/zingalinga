import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  try {
    await prisma.package.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  try {
    const packageData = await request.json();
    
    const updatedPackage = await prisma.package.update({
      where: { id: params.id },
      data: {
        name: packageData.name,
        description: packageData.description,
        price: parseFloat(packageData.price) || 0.00,
        type: packageData.type,
        isActive: packageData.isActive !== undefined ? packageData.isActive : true,
        isPopular: packageData.isPopular !== undefined ? packageData.isPopular : false,
        features: packageData.features,
        coverImage: packageData.coverImage || '',
        contentIds: packageData.contentIds || []
      }
    });
    
    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}