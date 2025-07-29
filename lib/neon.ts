// Neon PostgreSQL Database Configuration
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, integer, timestamp, jsonb, boolean, serial } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Database connection with fallback for development
const databaseUrl = process.env.DATABASE_URL;
let db: any = null;
let isDbAvailable = false;

if (databaseUrl && !databaseUrl.includes('placeholder')) {
  try {
    const sql = neon(databaseUrl);
    db = drizzle(sql);
    isDbAvailable = true;
    console.log('✅ Neon database connected');
  } catch (error) {
    console.warn('⚠️ Neon database connection failed:', error);
    isDbAvailable = false;
  }
} else {
  console.warn('⚠️ No valid DATABASE_URL found. Database features will be disabled for local development.');
  isDbAvailable = false;
}

export { db, isDbAvailable };

// Database Schema
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  purchasedModules: text('purchased_modules').array(),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login').defaultNow(),
  totalSpent: integer('total_spent').default(0),
  phone: text('phone'),
  address: text('address'),
  isActive: boolean('is_active').default(true)
});

export const modules = pgTable('modules', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  duration: text('duration'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  fullContent: text('full_content'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const purchases = pgTable('purchases', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  moduleId: text('module_id').notNull(),
  purchaseDate: timestamp('purchase_date').defaultNow(),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('completed')
});

export const contentFiles = pgTable('content_files', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type').notNull(),
  size: integer('size'),
  uploadedAt: timestamp('uploaded_at').defaultNow()
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type ContentFile = typeof contentFiles.$inferSelect;
export type NewContentFile = typeof contentFiles.$inferInsert;

// Database helper functions
export async function createUser(user: NewUser) {
  return await db.insert(users).values(user).returning();
}

export async function getUserByEmail(email: string) {
  return await db.select().from(users).where(eq(users.email, email)).limit(1);
}

export async function getAllUsers() {
  return await db.select().from(users);
}

export async function getAllModules() {
  return await db.select().from(modules);
}

export async function createPurchase(purchase: NewPurchase) {
  return await db.insert(purchases).values(purchase).returning();
}

export async function getUserPurchases(userId: string) {
  return await db.select().from(purchases).where(eq(purchases.userId, userId));
}