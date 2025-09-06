import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint is deprecated - use direct Prisma API endpoints instead
  return NextResponse.json({ 
    message: 'This endpoint is deprecated. Use direct API endpoints instead.',
    endpoints: {
      users: '/api/users',
      modules: '/api/modules', 
      purchases: '/api/purchases',
      packages: '/api/packages'
    }
  }, { status: 410 });
}

export async function POST() {
  // This endpoint is deprecated - use direct Prisma API endpoints instead
  return NextResponse.json({ 
    message: 'This endpoint is deprecated. Use direct API endpoints instead.'
  }, { status: 410 });
}