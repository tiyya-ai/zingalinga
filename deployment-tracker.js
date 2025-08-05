#!/usr/bin/env node

/**
 * Zinga Linga Deployment Tracker
 * تتبع خطوات النشر خطوة بخطوة
 */

const readline = require('readline');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class DeploymentTracker {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.steps = [
      {
        id: 1,
        title: "🔧 تحضير التطبيق للنشر",
        description: "تثبيت التبعيات وبناء المشروع",
        commands: [
          "npm install",
          "npm run build"
        ],
        completed: false
      },
      {
        id: 2,
        title: "📦 إنشاء حزمة النشر",
        description: "ضغط الملفات المطلوبة للنشر",
        commands: [
          "tar -czf zinga-linga-vps.tar.gz .next node_modules package.json package-lock.json public"
        ],
        completed: false
      },
      {
        id: 3,
        title: "���️ رفع الحزمة إلى VPS",
        description: "نقل الملفات إلى السيرفر",
        commands: [
          "scp zinga-linga-vps.tar.gz root@109.199.106.28:/root/"
        ],
        completed: false
      },
      {
        id: 4,
        title: "🔐 الاتصال بـ VPS",
        description: "الدخول إلى السيرفر عبر SSH",
        commands: [
          "ssh root@109.199.106.28"
        ],
        completed: false,
        manual: true
      },
      {
        id: 5,
        title: "📁 إعداد مجلد التطبيق",
        description: "إنشاء المجلد واستخراج الملفات",
        commands: [
          "mkdir -p /var/www/zinga-linga",
          "cd /var/www/zinga-linga",
          "tar -xzf /root/zinga-linga-vps.tar.gz"
        ],
        completed: false,
        vps: true
      },
      {
        id: 6,
        title: "🔧 تثبيت التبعيات على VPS",
        description: "تثبيت حزم Node.js على السيرفر",
        commands: [
          "npm install --production"
        ],
        completed: false,
        vps: true
      },
      {
        id: 7,
        title: "🚀 تشغيل التطبيق مع PM2",
        description: "بدء تشغيل التطبيق وحفظ الإعدادات",
        commands: [
          "npm install -g pm2",
          "pm2 start npm --name \"zinga-linga\" -- start",
          "pm2 save"
        ],
        completed: false,
        vps: true
      },
      {
        id: 8,
        title: "🧹 تنظيف الملفات المؤقتة",
        description: "حذف ملفات النشر المؤقتة",
        commands: [
          "rm /root/zinga-linga-vps.tar.gz"
        ],
        completed: false,
        vps: true
      },
      {
        id: 9,
        title: "🌐 إعداد NGINX (اختياري)",
        description: "تكوين خادم الويب",
        commands: [
          "apt-get update",
          "apt-get install nginx",
          "# إنشاء ملف التكوين",
          "ln -s /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/",
          "nginx -t",
          "systemctl restart nginx"
        ],
        completed: false,
        vps: true,
        optional: true
      },
      {
        id: 10,
        title: "✅ التحقق من النشر",
        description: "فحص حالة التطبيق والوصول إليه",
        commands: [
          "pm2 status",
          "pm2 logs zinga-linga",
          "curl http://109.199.106.28:3000"
        ],
        completed: false,
        vps: true
      }
    ];
    
    this.currentStep = 0;
    this.deploymentLog = [];
  }

  async start() {
    console.log('\n🚀 مرحباً بك في متتبع نشر Zinga Linga');
    console.log('====================================\n');
    
    await this.loadProgress();
    await this.showMenu();
  }

  async loadProgress() {
    try {
      const data = await fs.readFile('deployment-progress.json', 'utf8');
      const progress = JSON.parse(data);
      this.steps = progress.steps || this.steps;
      this.currentStep = progress.currentStep || 0;
      this.deploymentLog = progress.deploymentLog || [];
      console.log('📋 تم تحميل التقدم المحفوظ');
    } catch (error) {
      console.log('📋 بدء جلسة نشر جديدة');
    }
  }

  async saveProgress() {
    const progress = {
      steps: this.steps,
      currentStep: this.currentStep,
      deploymentLog: this.deploymentLog,
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile('deployment-progress.json', JSON.stringify(progress, null, 2));
  }

  async showMenu() {
    console.log('\n📋 خيارات النشر:');
    console.log('1. عرض جميع الخطوات');
    console.log('2. تنفيذ الخطوة التا��ية');
    console.log('3. تنفيذ خطوة محددة');
    console.log('4. عرض سجل النشر');
    console.log('5. إعادة تعيين التقدم');
    console.log('6. إنشاء سكريبت نشر تلقائي');
    console.log('7. خروج');
    
    const choice = await this.askQuestion('\nاختر رقم الخيار: ');
    
    switch (choice) {
      case '1':
        await this.showAllSteps();
        break;
      case '2':
        await this.executeNextStep();
        break;
      case '3':
        await this.executeSpecificStep();
        break;
      case '4':
        await this.showDeploymentLog();
        break;
      case '5':
        await this.resetProgress();
        break;
      case '6':
        await this.createAutoDeployScript();
        break;
      case '7':
        console.log('👋 شكراً لاستخدام متتبع النشر!');
        this.rl.close();
        return;
      default:
        console.log('❌ خيار غير صحيح');
    }
    
    await this.showMenu();
  }

  async showAllSteps() {
    console.log('\n📋 جميع خطوات النشر:\n');
    
    this.steps.forEach((step, index) => {
      const status = step.completed ? '✅' : '⏳';
      const current = index === this.currentStep ? '👉 ' : '   ';
      const optional = step.optional ? '(اختياري)' : '';
      const location = step.vps ? '[VPS]' : '[محلي]';
      
      console.log(`${current}${status} ${step.id}. ${step.title} ${optional}`);
      console.log(`     ${location} ${step.description}`);
      
      if (step.commands.length > 0) {
        console.log('     الأوامر:');
        step.commands.forEach(cmd => {
          console.log(`       $ ${cmd}`);
        });
      }
      console.log('');
    });
  }

  async executeNextStep() {
    if (this.currentStep >= this.steps.length) {
      console.log('🎉 تم إكمال جميع خطوات النشر!');
      return;
    }
    
    const step = this.steps[this.currentStep];
    await this.executeStep(step);
  }

  async executeSpecificStep() {
    const stepNumber = await this.askQuestion('أدخل رقم الخطوة (1-10): ');
    const stepIndex = parseInt(stepNumber) - 1;
    
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      console.log('❌ رقم خطوة غير صحيح');
      return;
    }
    
    const step = this.steps[stepIndex];
    await this.executeStep(step);
  }

  async executeStep(step) {
    console.log(`\n🔄 تنفيذ: ${step.title}`);
    console.log(`📝 ${step.description}\n`);
    
    if (step.vps) {
      console.log('⚠️  هذه الخطوة تتطلب تنفيذها عل�� VPS');
      console.log('🔐 تأكد من اتصالك بـ VPS عبر SSH\n');
    }
    
    if (step.manual) {
      console.log('📋 خطوة يدوية - يرجى تنفيذ الأوامر التالية:');
      step.commands.forEach(cmd => {
        console.log(`$ ${cmd}`);
      });
      
      const completed = await this.askQuestion('\nهل تم تنفيذ هذه الخطوة؟ (y/n): ');
      if (completed.toLowerCase() === 'y') {
        step.completed = true;
        this.logStep(step, 'تم تنفيذها يدوياً');
        console.log('✅ تم تسجيل الخطوة كمكتملة');
      }
    } else if (step.vps) {
      console.log('📋 أوامر VPS - يرجى تنفيذها على السيرفر:');
      step.commands.forEach(cmd => {
        console.log(`$ ${cmd}`);
      });
      
      const completed = await this.askQuestion('\nهل تم تنفيذ هذه الأوامر على VPS؟ (y/n): ');
      if (completed.toLowerCase() === 'y') {
        step.completed = true;
        this.logStep(step, 'تم تنفيذها على VPS');
        console.log('✅ تم تسجيل الخطوة كمكتملة');
      }
    } else {
      // تنفيذ محلي
      const execute = await this.askQuestion('هل تريد تنفيذ الأوامر تلقائياً؟ (y/n): ');
      
      if (execute.toLowerCase() === 'y') {
        for (const command of step.commands) {
          console.log(`\n🔄 تنفيذ: ${command}`);
          
          try {
            const result = await this.executeCommand(command);
            console.log('✅ تم التنفيذ بنجاح');
            if (result.stdout) console.log(result.stdout);
            if (result.stderr) console.log('تحذيرات:', result.stderr);
          } catch (error) {
            console.log('❌ خطأ في التنفيذ:', error.message);
            const continueAnyway = await this.askQuestion('هل تريد المتابعة؟ (y/n): ');
            if (continueAnyway.toLowerCase() !== 'y') {
              return;
            }
          }
        }
        
        step.completed = true;
        this.logStep(step, 'تم تنفيذها تلقائياً');
        console.log('✅ تم إكمال الخطوة');
      } else {
        console.log('📋 يرجى تنفيذ الأوامر التالية يدوياً:');
        step.commands.forEach(cmd => {
          console.log(`$ ${cmd}`);
        });
        
        const completed = await this.askQuestion('\nهل تم تنفيذ الأوامر؟ (y/n): ');
        if (completed.toLowerCase() === 'y') {
          step.completed = true;
          this.logStep(step, 'تم تنفيذها يدوياً');
          console.log('✅ تم تسجيل الخطوة كمكتملة');
        }
      }
    }
    
    if (step.completed && this.currentStep === this.steps.indexOf(step)) {
      this.currentStep++;
    }
    
    await this.saveProgress();
  }

  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  logStep(step, status) {
    this.deploymentLog.push({
      timestamp: new Date().toISOString(),
      step: step.title,
      status: status,
      id: step.id
    });
  }

  async showDeploymentLog() {
    console.log('\n📊 سجل النشر:\n');
    
    if (this.deploymentLog.length === 0) {
      console.log('📝 لا توجد سجلات بعد');
      return;
    }
    
    this.deploymentLog.forEach(log => {
      const date = new Date(log.timestamp).toLocaleString('ar-SA');
      console.log(`${date} - ${log.step}: ${log.status}`);
    });
    
    const completedSteps = this.steps.filter(step => step.completed).length;
    const totalSteps = this.steps.length;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    
    console.log(`\n📈 التقدم: ${completedSteps}/${totalSteps} (${progress}%)`);
  }

  async resetProgress() {
    const confirm = await this.askQuestion('هل أنت متأكد من إعادة تعيين التقدم؟ (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      this.steps.forEach(step => step.completed = false);
      this.currentStep = 0;
      this.deploymentLog = [];
      await this.saveProgress();
      console.log('🔄 تم إعادة تعيين التقدم');
    }
  }

  async createAutoDeployScript() {
    console.log('\n🤖 إنشاء سكريبت النشر التلقائي...');
    
    const vpsIP = await this.askQuestion('أدخل IP الخاص بـ VPS (افتراضي: 109.199.106.28): ') || '109.199.106.28';
    const vpsUser = await this.askQuestion('أدخل اسم المستخدم (افتراضي: root): ') || 'root';
    const appName = await this.askQuestion('أدخل اسم التطبيق (افتراضي: zinga-linga): ') || 'zinga-linga';
    
    const deployScript = `#!/bin/bash

# Zinga Linga Auto Deploy Script
# Generated by Deployment Tracker

set -e

echo "🚀 بدء النشر التلقائي لـ ${appName}..."

# Step 1: Build locally
echo "🔧 بناء التطبيق محلياً..."
npm install
npm run build

# Step 2: Create deployment package
echo "📦 إنشاء حزمة النشر..."
tar -czf ${appName}-deploy.tar.gz .next node_modules package.json package-lock.json public

# Step 3: Upload to VPS
echo "⬆️ رفع الحزمة إلى VPS..."
scp ${appName}-deploy.tar.gz ${vpsUser}@${vpsIP}:/tmp/

# Step 4: Deploy on VPS
echo "🚀 النشر على VPS..."
ssh ${vpsUser}@${vpsIP} << 'ENDSSH'
# Create app directory
mkdir -p /var/www/${appName}
cd /var/www/${appName}

# Stop existing app
pm2 stop ${appName} || true

# Remove old files
rm -rf .next node_modules package.json package-lock.json public

# Extract new files
tar -xzf /tmp/${appName}-deploy.tar.gz

# Install dependencies
npm install --production

# Start app
pm2 start npm --name "${appName}" -- start
pm2 save

# Cleanup
rm /tmp/${appName}-deploy.tar.gz

echo "✅ تم النشر بنجاح!"
echo "🌐 التطبيق متاح على: http://${vpsIP}:3000"
ENDSSH

# Cleanup local files
rm ${appName}-deploy.tar.gz

echo "🎉 تم إكمال النشر التلقائي!"
`;

    await fs.writeFile('auto-deploy.sh', deployScript);
    
    // Make script executable on Unix systems
    try {
      await fs.chmod('auto-deploy.sh', 0o755);
    } catch (error) {
      // Ignore on Windows
    }
    
    console.log('✅ تم إنشاء سكريبت النشر التلقائي: auto-deploy.sh');
    console.log('🔧 لتنفيذ النشر التلقائي، قم بتشغيل: ./auto-deploy.sh');
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

// Start the deployment tracker
if (require.main === module) {
  const tracker = new DeploymentTracker();
  tracker.start().catch(console.error);
}

module.exports = DeploymentTracker;