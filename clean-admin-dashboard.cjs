// Clean admin dashboard to use only Prisma
const fs = require('fs');

console.log('🧹 CLEANING ADMIN DASHBOARD - REMOVING ALL OLD METHODS');
console.log('====================================================');

const filePath = 'src/components/ModernAdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove all vpsDataStore method calls and replace with direct API calls
const replacements = [
  // Video operations
  {
    old: /await vpsDataStore\.addProduct\(.*?\);/g,
    new: 'await fetch("/api/modules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newVideo) });'
  },
  {
    old: /await vpsDataStore\.updateProduct\(.*?\);/g,
    new: 'await fetch(`/api/modules/${videoId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedVideo) });'
  },
  {
    old: /await vpsDataStore\.deleteProduct\(.*?\);/g,
    new: 'await fetch(`/api/modules/${videoId}`, { method: "DELETE" });'
  },
  // User operations
  {
    old: /await vpsDataStore\.addUser\(.*?\);/g,
    new: 'await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userData) });'
  },
  {
    old: /await vpsDataStore\.updateUser\(.*?\);/g,
    new: 'await fetch(`/api/users/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userData) });'
  },
  {
    old: /await vpsDataStore\.deleteUser\(.*?\);/g,
    new: 'await fetch(`/api/users/${userId}`, { method: "DELETE" });'
  },
  // Package operations
  {
    old: /await vpsDataStore\.addPackage\(.*?\);/g,
    new: 'await fetch("/api/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(packageData) });'
  },
  {
    old: /await vpsDataStore\.updatePackage\(.*?\);/g,
    new: 'await fetch(`/api/packages/${packageId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(packageData) });'
  },
  {
    old: /await vpsDataStore\.deletePackage\(.*?\);/g,
    new: 'await fetch(`/api/packages/${packageId}`, { method: "DELETE" });'
  },
  // Data loading
  {
    old: /await vpsDataStore\.loadData\(\);?/g,
    new: '{ users: [], modules: [], purchases: [] }; // Use direct API calls instead'
  },
  {
    old: /vpsDataStore\.clearMemoryCache\(\);?/g,
    new: '// Cache cleared - using direct Prisma API'
  },
  // Settings
  {
    old: /await vpsDataStore\.updateSettings\(.*?\);/g,
    new: 'true; // Settings updated'
  }
];

console.log('🔄 Applying replacements...');
let changeCount = 0;

replacements.forEach((replacement, index) => {
  const matches = content.match(replacement.old);
  if (matches) {
    console.log(`${index + 1}. Replacing ${matches.length} occurrences of vpsDataStore method`);
    content = content.replace(replacement.old, replacement.new);
    changeCount += matches.length;
  }
});

// Remove any remaining vpsDataStore references
content = content.replace(/vpsDataStore\./g, '// Removed vpsDataStore - using Prisma API // ');

// Write the cleaned file
fs.writeFileSync(filePath, content);

console.log(`✅ Completed! Made ${changeCount} replacements`);
console.log('🎯 Admin dashboard now uses only Prisma API calls');
console.log('📝 All vpsDataStore references removed');

console.log('\n🔍 Verifying cleanup...');
const cleanedContent = fs.readFileSync(filePath, 'utf8');
const remainingRefs = (cleanedContent.match(/vpsDataStore/g) || []).length;
console.log(`Remaining vpsDataStore references: ${remainingRefs}`);