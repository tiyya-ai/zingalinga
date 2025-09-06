import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('📋 AUDIT API: Fetching audit logs...');
    
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50 // Last 50 actions
    });
    
    console.log('📋 AUDIT API: Found', auditLogs.length, 'audit entries');
    
    return NextResponse.json({
      count: auditLogs.length,
      logs: auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        entityId: log.entityId,
        entityType: log.entityType,
        timestamp: log.timestamp,
        adminId: log.adminId,
        details: log.details
      }))
    });
  } catch (error) {
    console.error('📋 AUDIT API: Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs', details: error }, { status: 500 });
  }
}