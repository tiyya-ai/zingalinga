import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(modules.map(module => ({
      ...module,
      tags: typeof module.tags === 'string' ? JSON.parse(module.tags) : module.tags
    })));
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const moduleData = await request.json();
    console.log('Creating module with Prisma:', moduleData);
    
    const module = await prisma.module.create({
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
    
    console.log('Module created successfully:', module);
    return NextResponse.json(module);
    
  } catch (error) {
    console.error('Error creating module:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create module', 
      details: errorMessage 
    }, { status: 500 });
  }
}