#!/usr/bin/env node

/**
 * Zinga Linga Deployment Test Suite
 * مجموعة اختبارات النشر لـ Zinga Linga
 */

const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const fs = require('fs');

class DeploymentTester {
  constructor() {
    this.config = {
      vps: {
        ip: '109.199.106.28',
        user: 'root',
        password: 'Secureweb25',
        port: 22
      },
      app: {
        name: 'zinga-linga',
        domain: 'zingalinga.io',
        localPort: 3000,
        deployPath: '/var/www/zinga-linga'
      }
    };
    
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runAllTests() {
    console.log('🧪 بدء اختبارات النشر لـ Zinga Linga');
    console.log('=====================================\n');

    // Local tests
    await this.testLocalBuild();
    await this.testLocalFiles();
    await this.testGitRepository();
    
    // VPS tests
    await this.testVPSConnection();
    await this.testVPSServices();
    await this.testApplicationStatus();
    
    // Web tests
    await this.testWebsiteAccess();
    await this.testAPIEndpoints();
    
    // GitHub Actions tests
    await this.testGitHubActionsSetup();
    
    this.displayResults();
  }

  async testLocalBuild() {
    await this.runTest('🏗️ اختبار البناء المحلي', async () => {
      // Check if .next directory exists
      if (!fs.existsSync('.next')) {
        throw new Error('مجلد .next غير موجود - يرجى تشغيل npm run build');
      }
      
      // Check if build ID exists
      if (!fs.existsSync('.next/BUILD_ID')) {
        throw new Error('BUILD_ID غير موجود - البناء غير مكتمل');
      }
      
      const buildId = fs.readFileSync('.next/BUILD_ID', 'utf8').trim();
      return `Build ID: ${buildId}`;
    });
  }

  async testLocalFiles() {
    await this.runTest('📁 اختبار الملفات المطلوبة', async () => {
      const requiredFiles = [
        'package.json',
        'next.config.js',
        '.github/workflows/deploy.yml',
        'vps-config.js'
      ];
      
      const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
      
      if (missingFiles.length > 0) {
        throw new Error(`ملفات مفقودة: ${missingFiles.join(', ')}`);
      }
      
      return `جميع الملفات المطلوبة موجودة (${requiredFiles.length})`;
    });
  }

  async testGitRepository() {
    await this.runTest('📋 اختبار مستودع Git', async () => {
      return new Promise((resolve, reject) => {
        exec('git remote -v', (error, stdout, stderr) => {
          if (error) {
            reject(new Error('مستودع Git غير مُعد - يرجى ربط المشروع بـ GitHub'));
            return;
          }
          
          if (!stdout.includes('github.com')) {
            reject(new Error('لا يوجد remote GitHub - يرجى إضافة GitHub remote'));
            return;
          }
          
          resolve('مستودع GitHub مُعد بشكل صحيح');
        });
      });
    });
  }

  async testVPSConnection() {
    await this.runTest('🔐 اختبار الاتصال بـ VPS', async () => {
      return new Promise((resolve, reject) => {
        exec(`ping -c 1 ${this.config.vps.ip}`, (error, stdout, stderr) => {
          if (error) {
            reject(new Error('لا يمكن الوصول إلى VPS - تحقق من الاتصال'));
            return;
          }
          
          resolve(`VPS متاح (${this.config.vps.ip})`);
        });
      });
    });
  }

  async testVPSServices() {
    await this.runTest('🔧 اختبار خدمات VPS', async () => {
      return new Promise((resolve, reject) => {
        const sshCommand = `sshpass -p "${this.config.vps.password}" ssh -o StrictHostKeyChecking=no ${this.config.vps.user}@${this.config.vps.ip}`;
        
        exec(`${sshCommand} "systemctl is-active nginx && pm2 --version && node --version"`, (error, stdout, stderr) => {
          if (error) {
            reject(new Error('خدمات VPS غير مُعدة بشكل صحيح'));
            return;
          }
          
          const services = stdout.trim().split('\n');
          resolve(`NGINX: ${services[0]}, PM2: ${services[1]}, Node.js: ${services[2]}`);
        });
      });
    });
  }

  async testApplicationStatus() {
    await this.runTest('🚀 اختبار حالة التطبيق', async () => {
      return new Promise((resolve, reject) => {
        const sshCommand = `sshpass -p "${this.config.vps.password}" ssh -o StrictHostKeyChecking=no ${this.config.vps.user}@${this.config.vps.ip}`;
        
        exec(`${sshCommand} "pm2 list | grep ${this.config.app.name}"`, (error, stdout, stderr) => {
          if (error || !stdout.includes(this.config.app.name)) {
            reject(new Error('التطبيق غير مُشغل على PM2'));
            return;
          }
          
          if (stdout.includes('online')) {
            resolve('التطبيق يعمل بشكل صحيح');
          } else {
            reject(new Error('التطبيق متوقف أو يواجه مشاكل'));
          }
        });
      });
    });
  }

  async testWebsiteAccess() {
    await this.runTest('🌐 اختبار الوصول للموقع', async () => {
      const urls = [
        `http://${this.config.app.domain}`,
        `http://${this.config.vps.ip}:${this.config.app.localPort}`,
        `http://${this.config.vps.ip}`
      ];

      const results = [];
      
      for (const url of urls) {
        try {
          const status = await this.checkURL(url);
          results.push(`${url}: ${status}`);
        } catch (error) {
          results.push(`${url}: خطأ`);
        }
      }
      
      return results.join(', ');
    });
  }

  async testAPIEndpoints() {
    await this.runTest('🔌 اختبار API Endpoints', async () => {
      const endpoints = [
        '/api/data',
        '/api/health'
      ];
      
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const url = `http://${this.config.app.domain}${endpoint}`;
          const status = await this.checkURL(url);
          results.push(`${endpoint}: ${status}`);
        } catch (error) {
          results.push(`${endpoint}: غير متاح`);
        }
      }
      
      return results.join(', ');
    });
  }

  async testGitHubActionsSetup() {
    await this.runTest('⚙️ اختبار إعداد GitHub Actions', async () => {
      const workflowFile = '.github/workflows/deploy.yml';
      
      if (!fs.existsSync(workflowFile)) {
        throw new Error('ملف GitHub Actions غير موجود');
      }
      
      const content = fs.readFileSync(workflowFile, 'utf8');
      
      const requiredSecrets = ['VPS_HOST', 'VPS_USER', 'VPS_SSH_KEY'];
      const missingSecrets = requiredSecrets.filter(secret => !content.includes(`secrets.${secret}`));
      
      if (missingSecrets.length > 0) {
        throw new Error(`GitHub Secrets مفقودة: ${missingSecrets.join(', ')}`);
      }
      
      return 'GitHub Actions مُعد بشكل صحيح';
    });
  }

  async checkURL(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (url.startsWith('https') ? 443 : 80),
        path: urlObj.pathname,
        method: 'GET',
        timeout: 5000
      };

      const req = client.request(options, (res) => {
        resolve(`${res.statusCode}`);
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    });
  }

  async runTest(name, testFunction) {
    this.results.total++;
    
    try {
      console.log(`🔄 ${name}...`);
      const result = await testFunction();
      console.log(`✅ ${name}: ${result}`);
      this.results.passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      this.results.failed++;
    }
    
    console.log('');
  }

  displayResults() {
    console.log('📊 نتائج الاختبارات');
    console.log('==================');
    console.log(`✅ نجح: ${this.results.passed}`);
    console.log(`❌ فشل: ${this.results.failed}`);
    console.log(`📋 المجموع: ${this.results.total}`);
    
    const percentage = Math.round((this.results.passed / this.results.total) * 100);
    console.log(`📈 معدل النجاح: ${percentage}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 جميع الاختبارات نجحت! النشر جاهز.');
    } else {
      console.log('\n��️ يوجد مشاكل تحتاج إلى حل قبل النشر.');
    }
    
    console.log('\n📋 الخطوات التالية:');
    if (this.results.failed > 0) {
      console.log('1. حل المشاكل المذكورة أعلاه');
      console.log('2. إعادة تشغيل الاختبارات');
    } else {
      console.log('1. اعمل commit و push للتفعيل النشر التلقائي');
      console.log('2. راقب GitHub Actions');
      console.log('3. تحقق من الموقع على http://zingalinga.io');
    }
  }

  async quickFix() {
    console.log('🔧 محاولة إصلاح سريع...\n');
    
    // Fix 1: Build if .next doesn't exist
    if (!fs.existsSync('.next')) {
      console.log('🏗️ بناء التطبيق...');
      await this.executeCommand('npm run build');
    }
    
    // Fix 2: Restart application on VPS
    console.log('🔄 إعادة تشغيل التطبيق على VPS...');
    const sshCommand = `sshpass -p "${this.config.vps.password}" ssh -o StrictHostKeyChecking=no ${this.config.vps.user}@${this.config.vps.ip}`;
    await this.executeCommand(`${sshCommand} "pm2 restart ${this.config.app.name} && systemctl reload nginx"`);
    
    console.log('✅ تم الإصلاح السريع');
  }

  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`❌ خطأ: ${error.message}`);
          reject(error);
        } else {
          console.log(`✅ تم التنفيذ بنجاح`);
          resolve(stdout);
        }
      });
    });
  }
}

// CLI Interface
if (require.main === module) {
  const tester = new DeploymentTester();
  const args = process.argv.slice(2);
  
  if (args.includes('--fix')) {
    tester.quickFix().catch(console.error);
  } else {
    tester.runAllTests().catch(console.error);
  }
}

module.exports = DeploymentTester;