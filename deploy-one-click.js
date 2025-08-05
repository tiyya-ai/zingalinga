#!/usr/bin/env node

/**
 * ONE-CLICK DEPLOYMENT
 * Super simple deployment - just run and it works!
 */

const { exec } = require('child_process');
const fs = require('fs');

console.log('\n🚀 ONE-CLICK DEPLOYMENT - Zinga Linga');
console.log('=====================================\n');

console.log('✅ VPS: 109.199.106.28');
console.log('✅ Domain: http://zingalinga.io/');
console.log('✅ User: root\n');

async function deploy() {
    try {
        // Step 1: Build
        console.log('🔄 Step 1: Building website...');
        await runCommand('npm run build');
        console.log('✅ Build completed!\n');

        // Step 2: Package
        console.log('🔄 Step 2: Creating package...');
        await runCommand('tar -czf deploy.tar.gz .next package.json package-lock.json public src');
        console.log('✅ Package created!\n');

        // Step 3: Upload
        console.log('🔄 Step 3: Uploading to server...');
        await runCommand('scp deploy.tar.gz root@109.199.106.28:/tmp/');
        console.log('✅ Upload completed!\n');

        // Step 4: Deploy
        console.log('🔄 Step 4: Deploying on server...');
        const deployCmd = `ssh root@109.199.106.28 "cd /var/www/zinga-linga && tar -xzf /tmp/deploy.tar.gz && npm install --production && pm2 restart zinga-linga || pm2 start npm --name zinga-linga -- start && pm2 save && rm /tmp/deploy.tar.gz"`;
        await runCommand(deployCmd);
        console.log('✅ Deployment completed!\n');

        // Step 5: Cleanup
        console.log('🔄 Step 5: Cleaning up...');
        if (fs.existsSync('deploy.tar.gz')) {
            fs.unlinkSync('deploy.tar.gz');
        }
        console.log('✅ Cleanup completed!\n');

        // Success
        console.log('🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('========================\n');
        console.log('✅ Your website is now live at:');
        console.log('🌐 http://zingalinga.io/');
        console.log('🌐 http://109.199.106.28:3000\n');
        console.log('📋 To check status: ssh root@109.199.106.28 "pm2 status"\n');

    } catch (error) {
        console.log('\n❌ DEPLOYMENT FAILED!');
        console.log('Error:', error.message);
        console.log('\n🔧 Try running the command again or check your connection.\n');
        process.exit(1);
    }
}

function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                if (stdout) console.log(stdout);
                if (stderr) console.log('Warning:', stderr);
                resolve();
            }
        });
    });
}

// Start deployment
deploy();