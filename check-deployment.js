#!/usr/bin/env node

/**
 * Quick Deployment Status Checker
 * فحص سريع لحالة النشر
 */

const { exec } = require('child_process');
const https = require('https');
const http = require('http');

class DeploymentChecker {
  constructor() {
    this.vpsIP = '109.199.106.28';
    this.port = 3000;
    this.appName = 'zinga-linga';
  }

  async checkAll() {
    console.log('🔍 فحص حالة النشر...\n');
    
    await this.checkLocalBuild();
    await this.checkVPSConnection();
    await this.checkPM2Status();
    await this.checkWebsiteAccess();
    await this.checkNginxStatus();
    
    console.log('\n✅ تم إكمال فحص النشر');
  }

  async checkLocalBuild() {
    console.log('📦 فحص البناء المحلي...');
    
    try {
      const fs = require('fs');
      if (fs.existsSync('.next')) {
        console.log('✅ مجلد .next موجود');
        
        if (fs.existsSync('.next/BUILD_ID')) {
          const buildId = fs.readFileSync('.next/BUILD_ID', 'utf8').trim();
          console.log(`📋 Build ID: ${buildId}`);
        }
      } else {
        console.log('❌ مجلد .next غير موجود - يرجى تشغيل npm run build');
      }
    } catch (error) {
      console.log('❌ خطأ في فحص البناء المحلي:', error.message);
    }
  }

  async checkVPSConnection() {
    console.log('\n🔐 فحص الاتصال بـ VPS...');
    
    return new Promise((resolve) => {
      exec(`ping -c 1 ${this.vpsIP}`, (error, stdout, stderr) => {
        if (error) {
          console.log('❌ لا يمكن الوصول إلى VPS');
          console.log('🔧 تأكد من صحة IP والاتصال بالإنترنت');
        } else {
          console.log('✅ VPS متاح ويمكن الوصول إليه');
        }
        resolve();
      });
    });
  }

  async checkPM2Status() {
    console.log('\n🚀 فحص حالة PM2...');
    
    return new Promise((resolve) => {
      exec(`ssh root@${this.vpsIP} "pm2 status"`, (error, stdout, stderr) => {
        if (error) {
          console.log('❌ لا يمكن الاتصال بـ VPS أو PM2 غير مثبت');
          console.log('🔧 تأكد من إعداد SSH وتثبيت PM2');
        } else {
          console.log('✅ حالة PM2:');
          console.log(stdout);
          
          if (stdout.includes(this.appName)) {
            console.log(`✅ ا��تطبيق ${this.appName} يعمل`);
          } else {
            console.log(`❌ التطبيق ${this.appName} غير موجود في PM2`);
          }
        }
        resolve();
      });
    });
  }

  async checkWebsiteAccess() {
    console.log('\n🌐 فحص الوصول للموقع...');
    
    const urls = [
      `http://${this.vpsIP}:${this.port}`,
      `http://${this.vpsIP}`,
      `https://${this.vpsIP}`
    ];

    for (const url of urls) {
      await this.checkURL(url);
    }
  }

  async checkURL(url) {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (url.startsWith('https') ? 443 : 80),
        path: '/',
        method: 'GET',
        timeout: 5000
      };

      const req = client.request(options, (res) => {
        console.log(`✅ ${url} - Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('🎉 الموقع يعمل بشكل صحيح!');
        }
        
        resolve();
      });

      req.on('error', (error) => {
        console.log(`❌ ${url} - خطأ: ${error.message}`);
        resolve();
      });

      req.on('timeout', () => {
        console.log(`⏰ ${url} - انتهت مهلة الاتصال`);
        req.destroy();
        resolve();
      });

      req.end();
    });
  }

  async checkNginxStatus() {
    console.log('\n🌐 فحص حالة NGINX...');
    
    return new Promise((resolve) => {
      exec(`ssh root@${this.vpsIP} "systemctl status nginx"`, (error, stdout, stderr) => {
        if (error) {
          console.log('❌ لا يمكن فحص حالة NGINX');
          console.log('🔧 قد يكون NGINX غير مثبت أو غير مُفعل');
        } else {
          if (stdout.includes('active (running)')) {
            console.log('✅ NGINX يعمل بشكل صحيح');
          } else {
            console.log('❌ NGINX لا يعمل');
            console.log('🔧 يرجى تشغيل: systemctl start nginx');
          }
        }
        resolve();
      });
    });
  }

  async checkLogs() {
    console.log('\n📋 عرض آخر سجلات التطبيق...');
    
    return new Promise((resolve) => {
      exec(`ssh root@${this.vpsIP} "pm2 logs ${this.appName} --lines 10"`, (error, stdout, stderr) => {
        if (error) {
          console.log('❌ لا يمكن عرض السجلات');
        } else {
          console.log('📋 آخر 10 سجلات:');
          console.log(stdout);
        }
        resolve();
      });
    });
  }

  async quickFix() {
    console.log('\n🔧 محاولة إصلاح سريع...');
    
    const commands = [
      `ssh root@${this.vpsIP} "cd /var/www/${this.appName} && pm2 restart ${this.appName}"`,
      `ssh root@${this.vpsIP} "systemctl restart nginx"`
    ];

    for (const command of commands) {
      console.log(`🔄 تنفيذ: ${command.split('"')[1]}`);
      
      await new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.log('❌ فشل في التنفيذ');
          } else {
            console.log('✅ تم التنفيذ بنجاح');
          }
          resolve();
        });
      });
    }
  }

  async showMenu() {
    console.log('\n🔍 خيارات فحص النشر:');
    console.log('1. فحص شامل');
    console.log('2. فحص حالة PM2');
    console.log('3. فحص الوصول للموقع');
    console.log('4. عرض السجلات');
    console.log('5. إصلاح سريع');
    console.log('6. خروج');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const choice = await new Promise((resolve) => {
      rl.question('\nاختر رقم الخيار: ', (answer) => {
        resolve(answer);
      });
    });

    rl.close();

    switch (choice) {
      case '1':
        await this.checkAll();
        break;
      case '2':
        await this.checkPM2Status();
        break;
      case '3':
        await this.checkWebsiteAccess();
        break;
      case '4':
        await this.checkLogs();
        break;
      case '5':
        await this.quickFix();
        break;
      case '6':
        console.log('👋 شكراً لاستخدام فاحص النشر!');
        return;
      default:
        console.log('❌ خيار غير صحيح');
    }

    // Show menu again
    setTimeout(() => this.showMenu(), 1000);
  }
}

// Start the checker
if (require.main === module) {
  const checker = new DeploymentChecker();
  
  // Check if command line argument is provided
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    checker.showMenu().catch(console.error);
  } else {
    switch (args[0]) {
      case 'all':
        checker.checkAll().catch(console.error);
        break;
      case 'pm2':
        checker.checkPM2Status().catch(console.error);
        break;
      case 'web':
        checker.checkWebsiteAccess().catch(console.error);
        break;
      case 'logs':
        checker.checkLogs().catch(console.error);
        break;
      case 'fix':
        checker.quickFix().catch(console.error);
        break;
      default:
        console.log('❌ خيار غير صحيح');
        console.log('الخيارات المتاحة: all, pm2, web, logs, fix');
    }
  }
}

module.exports = DeploymentChecker;