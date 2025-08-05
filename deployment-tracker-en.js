#!/usr/bin/env node

/**
 * Zinga Linga Deployment Tracker - English Version
 * Interactive deployment step tracker for easy website deployment
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
        title: "🔧 Prepare Application for Deployment",
        description: "Install dependencies and build the project",
        commands: [
          "npm install",
          "npm run build"
        ],
        completed: false
      },
      {
        id: 2,
        title: "📦 Create Deployment Package",
        description: "Compress required files for deployment",
        commands: [
          "tar -czf zinga-linga-vps.tar.gz .next node_modules package.json package-lock.json public"
        ],
        completed: false
      },
      {
        id: 3,
        title: "⬆️ Upload Package to VPS",
        description: "Transfer files to the server",
        commands: [
          "scp zinga-linga-vps.tar.gz root@109.199.106.28:/root/"
        ],
        completed: false
      },
      {
        id: 4,
        title: "🔐 Connect to VPS",
        description: "SSH into the server",
        commands: [
          "ssh root@109.199.106.28"
        ],
        completed: false,
        manual: true
      },
      {
        id: 5,
        title: "📁 Setup Application Directory",
        description: "Create directory and extract files",
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
        title: "🔧 Install Dependencies on VPS",
        description: "Install Node.js packages on server",
        commands: [
          "npm install --production"
        ],
        completed: false,
        vps: true
      },
      {
        id: 7,
        title: "🚀 Start Application with PM2",
        description: "Launch application and save configuration",
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
        title: "🧹 Clean Temporary Files",
        description: "Remove deployment temporary files",
        commands: [
          "rm /root/zinga-linga-vps.tar.gz"
        ],
        completed: false,
        vps: true
      },
      {
        id: 9,
        title: "🌐 Setup NGINX (Optional)",
        description: "Configure web server",
        commands: [
          "apt-get update",
          "apt-get install nginx",
          "# Create configuration file",
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
        title: "✅ Verify Deployment",
        description: "Check application status and access",
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
    console.log('\n🚀 Welcome to Zinga Linga Deployment Tracker');
    console.log('=============================================\n');
    
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
      console.log('📋 Loaded saved progress');
    } catch (error) {
      console.log('📋 Starting new deployment session');
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
    console.log('\n📋 Deployment Options:');
    console.log('1. Show all steps');
    console.log('2. Execute next step');
    console.log('3. Execute specific step');
    console.log('4. Show deployment log');
    console.log('5. Reset progress');
    console.log('6. Create auto-deploy script');
    console.log('7. Setup VPS');
    console.log('8. Test deployment');
    console.log('9. Exit');
    
    const choice = await this.askQuestion('\nChoose option number: ');
    
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
        await this.setupVPS();
        break;
      case '8':
        await this.testDeployment();
        break;
      case '9':
        console.log('👋 Thank you for using Deployment Tracker!');
        this.rl.close();
        return;
      default:
        console.log('❌ Invalid option');
    }
    
    await this.showMenu();
  }

  async showAllSteps() {
    console.log('\n📋 All Deployment Steps:\n');
    
    this.steps.forEach((step, index) => {
      const status = step.completed ? '✅' : '⏳';
      const current = index === this.currentStep ? '👉 ' : '   ';
      const optional = step.optional ? '(Optional)' : '';
      const location = step.vps ? '[VPS]' : '[Local]';
      
      console.log(`${current}${status} ${step.id}. ${step.title} ${optional}`);
      console.log(`     ${location} ${step.description}`);
      
      if (step.commands.length > 0) {
        console.log('     Commands:');
        step.commands.forEach(cmd => {
          console.log(`       $ ${cmd}`);
        });
      }
      console.log('');
    });
  }

  async executeNextStep() {
    if (this.currentStep >= this.steps.length) {
      console.log('🎉 All deployment steps completed!');
      return;
    }
    
    const step = this.steps[this.currentStep];
    await this.executeStep(step);
  }

  async executeSpecificStep() {
    const stepNumber = await this.askQuestion('Enter step number (1-10): ');
    const stepIndex = parseInt(stepNumber) - 1;
    
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      console.log('❌ Invalid step number');
      return;
    }
    
    const step = this.steps[stepIndex];
    await this.executeStep(step);
  }

  async executeStep(step) {
    console.log(`\n🔄 Executing: ${step.title}`);
    console.log(`📝 ${step.description}\n`);
    
    if (step.vps) {
      console.log('⚠️  This step requires execution on VPS');
      console.log('🔐 Make sure you are connected to VPS via SSH\n');
    }
    
    if (step.manual) {
      console.log('📋 Manual step - please execute the following commands:');
      step.commands.forEach(cmd => {
        console.log(`$ ${cmd}`);
      });
      
      const completed = await this.askQuestion('\nHas this step been completed? (y/n): ');
      if (completed.toLowerCase() === 'y') {
        step.completed = true;
        this.logStep(step, 'Completed manually');
        console.log('✅ Step marked as completed');
      }
    } else if (step.vps) {
      console.log('📋 VPS commands - please execute on server:');
      step.commands.forEach(cmd => {
        console.log(`$ ${cmd}`);
      });
      
      const completed = await this.askQuestion('\nHave these commands been executed on VPS? (y/n): ');
      if (completed.toLowerCase() === 'y') {
        step.completed = true;
        this.logStep(step, 'Completed on VPS');
        console.log('✅ Step marked as completed');
      }
    } else {
      // Local execution
      const execute = await this.askQuestion('Do you want to execute commands automatically? (y/n): ');
      
      if (execute.toLowerCase() === 'y') {
        for (const command of step.commands) {
          console.log(`\n🔄 Executing: ${command}`);
          
          try {
            const result = await this.executeCommand(command);
            console.log('✅ Executed successfully');
            if (result.stdout) console.log(result.stdout);
            if (result.stderr) console.log('Warnings:', result.stderr);
          } catch (error) {
            console.log('❌ Execution failed:', error.message);
            const continueAnyway = await this.askQuestion('Do you want to continue? (y/n): ');
            if (continueAnyway.toLowerCase() !== 'y') {
              return;
            }
          }
        }
        
        step.completed = true;
        this.logStep(step, 'Completed automatically');
        console.log('✅ Step completed');
      } else {
        console.log('📋 Please execute the following commands manually:');
        step.commands.forEach(cmd => {
          console.log(`$ ${cmd}`);
        });
        
        const completed = await this.askQuestion('\nHave the commands been executed? (y/n): ');
        if (completed.toLowerCase() === 'y') {
          step.completed = true;
          this.logStep(step, 'Completed manually');
          console.log('✅ Step marked as completed');
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
    console.log('\n📊 Deployment Log:\n');
    
    if (this.deploymentLog.length === 0) {
      console.log('📝 No logs yet');
      return;
    }
    
    this.deploymentLog.forEach(log => {
      const date = new Date(log.timestamp).toLocaleString();
      console.log(`${date} - ${log.step}: ${log.status}`);
    });
    
    const completedSteps = this.steps.filter(step => step.completed).length;
    const totalSteps = this.steps.length;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    
    console.log(`\n📈 Progress: ${completedSteps}/${totalSteps} (${progress}%)`);
  }

  async resetProgress() {
    const confirm = await this.askQuestion('Are you sure you want to reset progress? (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      this.steps.forEach(step => step.completed = false);
      this.currentStep = 0;
      this.deploymentLog = [];
      await this.saveProgress();
      console.log('🔄 Progress reset');
    }
  }

  async createAutoDeployScript() {
    console.log('\n🤖 Creating auto-deploy script...');
    
    const vpsIP = await this.askQuestion('Enter VPS IP (default: 109.199.106.28): ') || '109.199.106.28';
    const vpsUser = await this.askQuestion('Enter VPS username (default: root): ') || 'root';
    const appName = await this.askQuestion('Enter app name (default: zinga-linga): ') || 'zinga-linga';
    
    const deployScript = `#!/bin/bash

# Zinga Linga Auto Deploy Script
# Generated by Deployment Tracker

set -e

echo "🚀 Starting auto deployment for ${appName}..."

# Step 1: Build locally
echo "🔧 Building application locally..."
npm install
npm run build

# Step 2: Create deployment package
echo "📦 Creating deployment package..."
tar -czf ${appName}-deploy.tar.gz .next node_modules package.json package-lock.json public

# Step 3: Upload to VPS
echo "⬆️ Uploading package to VPS..."
scp ${appName}-deploy.tar.gz ${vpsUser}@${vpsIP}:/tmp/

# Step 4: Deploy on VPS
echo "🚀 Deploying on VPS..."
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

echo "✅ Deployment successful!"
echo "🌐 Application available at: http://${vpsIP}:3000"
ENDSSH

# Cleanup local files
rm ${appName}-deploy.tar.gz

echo "🎉 Auto deployment completed!"
`;

    await fs.writeFile('auto-deploy.sh', deployScript);
    
    // Make script executable on Unix systems
    try {
      await fs.chmod('auto-deploy.sh', 0o755);
    } catch (error) {
      // Ignore on Windows
    }
    
    console.log('✅ Auto-deploy script created: auto-deploy.sh');
    console.log('🔧 To run auto deployment: ./auto-deploy.sh');
  }

  async setupVPS() {
    console.log('\n🔧 VPS Setup Guide');
    console.log('==================\n');
    
    console.log('VPS Information:');
    console.log('• IP: 109.199.106.28');
    console.log('• User: root');
    console.log('• Password: Secureweb25');
    console.log('• Domain: http://zingalinga.io/');
    console.log('');
    
    console.log('Setup Options:');
    console.log('1. Run Windows setup script (setup-vps.bat)');
    console.log('2. Run Linux/Mac setup script (setup-vps.sh)');
    console.log('3. Manual setup instructions');
    console.log('4. Back to main menu');
    
    const choice = await this.askQuestion('Choose setup option: ');
    
    switch (choice) {
      case '1':
        console.log('🔧 Run: setup-vps.bat');
        break;
      case '2':
        console.log('🔧 Run: chmod +x setup-vps.sh && ./setup-vps.sh');
        break;
      case '3':
        await this.showManualSetup();
        break;
      case '4':
        return;
      default:
        console.log('❌ Invalid option');
    }
  }

  async showManualSetup() {
    console.log('\n📋 Manual VPS Setup Instructions:');
    console.log('==================================\n');
    
    const setupSteps = [
      '1. Connect to VPS: ssh root@109.199.106.28',
      '2. Update system: apt-get update && apt-get upgrade -y',
      '3. Install Node.js: curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs',
      '4. Install PM2: npm install -g pm2',
      '5. Install NGINX: apt-get install -y nginx',
      '6. Create app directory: mkdir -p /var/www/zinga-linga',
      '7. Setup firewall: ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw allow 3000 && ufw --force enable',
      '8. Configure NGINX (copy nginx-zingalinga-io.conf)',
      '9. Setup PM2 startup: pm2 startup && pm2 save'
    ];
    
    setupSteps.forEach(step => {
      console.log(step);
    });
    
    console.log('\n✅ After setup, your VPS will be ready for deployment!');
  }

  async testDeployment() {
    console.log('\n🧪 Testing Deployment...');
    console.log('========================\n');
    
    // Test local build
    console.log('🔄 Testing local build...');
    if (await this.fileExists('.next')) {
      console.log('✅ Build directory exists');
    } else {
      console.log('❌ Build directory missing - run npm run build');
    }
    
    // Test VPS connection
    console.log('\n🔄 Testing VPS connection...');
    try {
      await this.executeCommand('ping -c 1 109.199.106.28');
      console.log('✅ VPS is reachable');
    } catch (error) {
      console.log('❌ Cannot reach VPS');
    }
    
    // Test website access
    console.log('\n🔄 Testing website access...');
    console.log('🌐 Check manually: http://zingalinga.io/');
    console.log('🌐 Check manually: http://109.199.106.28:3000');
    
    console.log('\n📋 For complete testing, run: npm run deploy:test');
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
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