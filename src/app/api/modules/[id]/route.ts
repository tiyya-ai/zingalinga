import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const module = await prisma.module.findUnique({
      where: { id: params.id }
    });
    
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      ...module,
      tags: typeof module.tags === 'string' ? JSON.parse(module.tags) : module.tags
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleData = await request.json();
    
    const module = await prisma.module.update({
      where: { id: params.id },
      data: {
        title: moduleData.title,
        description: moduleData.description || null,
        price: parseFloat(moduleData.price) || 0.00,
        category: moduleData.category,
        tags: moduleData.tags || [],
        isActive: moduleData.isActive !== undefined ? moduleData.isActive : true,
        videoUrl: moduleData.videoUrl || null,
        thumbnail: moduleData.thumbnail || null,
        duration: moduleData.duration || null,
        ageGroup: moduleData.ageGroup || null,
        language: moduleData.language || 'English',
        videoType: moduleData.videoType || 'external'
      }
    });
    
    return NextResponse.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.module.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}