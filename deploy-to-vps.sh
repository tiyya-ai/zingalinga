#!/bin/bash
echo "🚀 DEPLOYING ZINGA LINGA WITH PRISMA TO VPS"
echo "============================================="

# 1. Update Prisma schema for MySQL
echo "1. Updating Prisma schema for MySQL..."
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String
  password          String
  role              Role      @default(USER)
  status            Status    @default(ACTIVE)
  totalSpent        Float     @default(0.00)
  purchasedModules  Json      @default("[]")
  avatar            String?
  phone             String?
  dateOfBirth       String?
  subscription      Subscription @default(FREE)
  createdAt         DateTime  @default(now())
  lastLogin         DateTime  @default(now())
  
  purchases         Purchase[]
  
  @@map("users")
}

model Module {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  price       Float    @default(0.00)
  category    String
  tags        Json     @default("[]")
  isActive    Boolean  @default(true)
  videoUrl    String?  @db.Text
  thumbnail   String?  @db.Text
  duration    String?
  ageGroup    String?
  language    String   @default("English")
  videoType   String   @default("external")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  purchases   Purchase[]
  
  @@map("modules")
}

model Purchase {
  id        String   @id @default(cuid())
  userId    String
  moduleId  String
  amount    Float
  status    String   @default("completed")
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  module    Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  @@map("purchases")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

enum Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum Subscription {
  FREE
  BASIC
  PREMIUM
  FAMILY
}
EOF

# 2. Update environment for production
echo "2. Updating environment variables..."
cat > .env << 'EOF'
DATABASE_URL="mysql://zingalinga_user:Zingalinga2025!@localhost:3306/zingalinga"
NODE_ENV=production
EOF

# 3. Install Prisma if not installed
echo "3. Installing Prisma..."
npm install prisma @prisma/client

# 4. Generate Prisma client
echo "4. Generating Prisma client..."
npx prisma generate

# 5. Push schema to database (creates tables)
echo "5. Creating database tables..."
npx prisma db push --accept-data-loss

# 6. Seed admin user
echo "6. Creating admin user..."
cat > seed-admin.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zingalinga.com' },
    update: {},
    create: {
      email: 'admin@zingalinga.com',
      name: 'Admin User',
      password: 'admin123',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  
  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

node seed-admin.js

# 7. Build the application
echo "7. Building application..."
npm run build

# 8. Start the application
echo "8. Starting application..."
pkill -f "next start" || true
npm run start &

echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🎯 TESTING CHECKLIST:"
echo "- Website: https://zingalinga.io"
echo "- Admin Panel: https://zingalinga.io/admin"
echo "- Login: admin@zingalinga.com / admin123"
echo "- Database: MySQL with Prisma"
echo "- Data Storage: All data persisted in database"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "- Check logs: pm2 logs"
echo "- Database: npx prisma studio"
echo "- Reset DB: npx prisma db push --force-reset"