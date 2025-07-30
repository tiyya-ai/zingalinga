import { NextRequest, NextResponse } from 'next/server';
import { neonDataStore } from '../../../../src/utils/neonDataStore';

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Loading data from Neon database...');
    
    // Load data using neonDataStore
    const data = await neonDataStore.loadData();
    
    return NextResponse.json({
      users: data.users || [],
      modules: data.modules || [],
      purchases: data.purchases || [],
      contentFiles: data.contentFiles || [],
      analytics: {
        totalUsers: (data.users || []).length,
        totalRevenue: (data.purchases || []).reduce((sum, p) => sum + (p.amount || 0), 0),
        totalPurchases: (data.purchases || []).length,
        activeModules: (data.modules || []).length
      }
    });
  } catch (error) {
    console.error('❌ Error loading from Neon:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}