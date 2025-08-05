// Find and replace all instances
const fs = require('fs');
const path = 'c:\\Users\\proth\\OneDrive\\Desktop\\zinga-linga-nextjs\\src\\components\\ProfessionalUserDashboard.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace all instances of the audio code
content = content.replace(/const audio = new Audio\(content\.audioUrl\);\s*audio\.play\(\)\.catch\(e => console\.error\('Audio play failed:', e\)\);\s*alert\(`🎧 Playing: \$\{content\.title\}`\);/g, 
  'setSelectedAudio(content);\n                                setShowAudioModal(true);');

fs.writeFileSync(path, content);
console.log('Fixed all audio instances');