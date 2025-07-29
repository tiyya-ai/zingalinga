import { NextRequest, NextResponse } from 'next/server';
import { db, isDbAvailable, users, modules, purchases, contentFiles } from '../../../../lib/neon';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { users: userData, modules: moduleData, purchases: purchaseData, contentFiles: fileData } = await request.json();

    // Check if database is available
    if (!isDbAvailable || !db) {
      console.log('⚠️ Database not available, data will only be saved locally');
      return NextResponse.json({ success: true, message: 'Data saved locally (database not available)' });
    }

    // Save users
    if (userData && Array.isArray(userData)) {
      for (const user of userData) {
        await db.insert(users).values({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          purchasedModules: user.purchasedModules || [],
          totalSpent: user.totalSpent || 0,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || new Date().toISOString()
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            name: user.name,
            purchasedModules: user.purchasedModules || [],
            totalSpent: user.totalSpent || 0,
            lastLogin: user.lastLogin || new Date().toISOString()
          }
        });
      }
    }

    // Save modules
    if (moduleData && Array.isArray(moduleData)) {
      for (const module of moduleData) {
        await db.insert(modules).values({
          id: module.id,
          title: module.title,
          description: module.description,
          price: module.price,
          category: module.category,
          difficulty: module.difficulty,
          duration: module.duration,
          videoUrl: module.videoUrl,
          thumbnailUrl: module.thumbnailUrl,
          fullContent: JSON.stringify(module.fullContent),
          createdAt: module.createdAt || new Date().toISOString()
        }).onConflictDoUpdate({
          target: modules.id,
          set: {
            title: module.title,
            description: module.description,
            price: module.price,
            category: module.category,
            difficulty: module.difficulty,
            duration: module.duration,
            videoUrl: module.videoUrl,
            thumbnailUrl: module.thumbnailUrl,
            fullContent: JSON.stringify(module.fullContent)
          }
        });
      }
    }

    // Save purchases
    if (purchaseData && Array.isArray(purchaseData)) {
      for (const purchase of purchaseData) {
        await db.insert(purchases).values({
          id: purchase.id,
          userId: purchase.userId,
          moduleId: purchase.moduleId,
          amount: purchase.amount,
          purchaseDate: purchase.purchaseDate || new Date().toISOString(),
          paymentMethod: purchase.paymentMethod || 'unknown'
        }).onConflictDoNothing();
      }
    }

    // Save content files
    if (fileData && Array.isArray(fileData)) {
      for (const file of fileData) {
        await db.insert(contentFiles).values({
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: file.url,
          moduleId: file.moduleId,
          uploadedAt: file.uploadedAt || new Date().toISOString()
        }).onConflictDoUpdate({
          target: contentFiles.id,
          set: {
            name: file.name,
            type: file.type,
            size: file.size,
            url: file.url,
            moduleId: file.moduleId
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save data error:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}