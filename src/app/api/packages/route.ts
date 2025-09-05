import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../utils/database';

export async function POST(request: NextRequest) {
  try {
    const pkg = await request.json();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await executeQuery(
      'INSERT INTO packages (id, name, description, price, modules, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        pkg.id,
        pkg.name,
        pkg.description,
        pkg.price,
        JSON.stringify(pkg.modules || []),
        pkg.status || 'active',
        now
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}