import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const packages = [
  {
    name: 'Explorer Pack',
    description: 'Where Letters Come to Life! 🎒',
    price: 30.00,
    type: 'subscription',
    features: JSON.stringify([
      'Letter Safari with playful letter recognition games',
      'Magic Word Builder to create fun words like a word wizard!',
      'Phonics party - sing along to catchy letter sounds',
      'Storytime with exciting tales role plays for children',
      '15 Learning Quests - colorful lessons that feel like playtime'
    ]),
    isActive: true,
    isPopular: false,
    coverImage: '',
    contentIds: []
  },
  {
    name: 'Adventurer Pack',
    description: 'Reading Superpowers Unlocked! 🚀',
    price: 45.00,
    type: 'subscription',
    features: JSON.stringify([
      'Everything in Explorer Pack PLUS:',
      'Word Architect: Build bigger, cooler words!',
      '25 Learning Quests with more stories, more adventures',
      '25 Gold Star Challenges to earn rewards after each lesson'
    ]),
    isActive: true,
    isPopular: true,
    coverImage: '',
    contentIds: []
  },
  {
    name: 'Roadtripper Pack',
    description: 'Learning On-The-Go! 🚗',
    price: 80.00,
    type: 'one-time',
    features: JSON.stringify([
      '125 Audio adventures, perfect for car rides & travel',
      '125 Sing-along phonics - turn travel time into learning time',
      'Story podcasts with African tales that spark imagination'
    ]),
    isActive: false,
    isPopular: false,
    coverImage: '',
    contentIds: []
  },
  {
    name: 'Zingalinga Bookie Pack',
    description: 'Interactive Learning Device 📚',
    price: 60.00,
    type: 'physical',
    features: JSON.stringify([
      'Fully aligned PP1 and PP2 equivalent literacy product',
      'Learn through stories anywhere anytime',
      'Battery that lasts 8 hours when fully utilized',
      'Interactive screen with 20+ interactive lessons'
    ]),
    isActive: true,
    isPopular: false,
    coverImage: '',
    contentIds: []
  }
];

async function main() {
  console.log('🌱 Seeding packages...');
  
  for (const packageData of packages) {
    const result = await prisma.package.create({
      data: packageData,
    });
    console.log(`✅ Package: ${result.name}`);
  }
  
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });