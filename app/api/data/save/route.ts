import { NextRequest, NextResponse } from 'next/server';
import { neonDataStore } from '../../../../src/utils/neonDataStore';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Save data to VPS database using neonDataStore
    await neonDataStore.saveData(data);
    
    console.log('✅ Data saved to VPS database');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully to VPS database' 
    });
  } catch (error) {
    console.error('Save data error:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}