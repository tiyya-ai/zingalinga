// Static users DISABLED - using only Prisma database
export const getStaticUsers = () => {
  console.log('⚠️ Static users disabled - using Prisma database only');
  return []; // Return empty array to force use of database users only
};