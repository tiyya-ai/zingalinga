'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider,
  Chip,
  Spinner
} from '@nextui-org/react';
import {
  Mail,
  Send,
  CheckCircle,
  AlertTriangle,
  TestTube,
  User,
  CreditCard
} from 'lucide-react';
import { emailService } from '../utils/emailService';
import { paymentMonitoringService } from '../utils/paymentMonitoring';

interface TestResult {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

export default function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [testType, setTestType] = useState('connection');
  const [customSubject, setCustomSubject] = useState('Test Email from Zinga Linga');
  const [customMessage, setCustomMessage] = useState('This is a test email to verify the email system is working correctly.');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (type: 'success' | 'error' | 'info', message: string) => {
    const result: TestResult = {
      type,
      message,
      timestamp: new Date()
    };
    setResults(prev => [result, ...prev].slice(0, 10)); // Keep last 10 results
  };

  const runTest = async () => {
    if (!testEmail && testType !== 'connection') {
      addResult('error', 'Please enter a test email address');
      return;
    }

    setTesting(true);
    addResult('info', `Starting ${testType} test...`);

    try {
      switch (testType) {
        case 'connection':
          const connectionResult = await emailService.testConnection();
          if (connectionResult.success) {
            addResult('success', 'Email service connection successful!');
          } else {
            addResult('error', `Connection failed: ${connectionResult.message}`);
          }
          break;

        case 'custom':
          await emailService.sendCustomEmail(
            testEmail,
            customSubject,
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Test Email</h2>
                <p>${customMessage}</p>
                <hr style="margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Sent from Zinga Linga Admin Dashboard</p>
              </div>
            `
          );
          addResult('success', `Custom test email sent to ${testEmail}`);
          break;

        case 'welcome':
          await emailService.sendWelcomeEmail(testEmail, 'Test User');
          addResult('success', `Welcome email sent to ${testEmail}`);
          break;

        case 'purchase':
          await emailService.sendPurchaseConfirmation(
            testEmail,
            'Test User',
            [
              { name: 'Premium Package', price: 29.99 },
              { name: 'Extra Content', price: 9.99 }
            ],
            39.98,
            'TEST-ORDER-123'
          );
          addResult('success', `Purchase confirmation sent to ${testEmail}`);
          break;

        case 'reminder':
          await emailService.sendRegistrationReminder(
            testEmail,
            'test-token-123',
            [
              { name: 'Premium Package', price: 29.99 }
            ],
            29.99
          );
          addResult('success', `Registration reminder sent to ${testEmail}`);
          break;

        case 'admin-registration':
          await emailService.notifyAdminNewRegistration(
            testEmail,
            'Test User'
          );
          addResult('success', 'Admin registration notification sent');
          break;

        case 'admin-purchase':
          await emailService.notifyAdminNewPurchase(
            testEmail,
            'Test User',
            [
              { name: 'Premium Package', price: 29.99 }
            ],
            29.99,
            'TEST-ORDER-456'
          );
          addResult('success', 'Admin purchase notification sent');
          break;

        case 'admin-overdue':
          await emailService.notifyAdminOverduePayment(
            testEmail,
            [
              { name: 'Premium Package', price: 29.99 }
            ],
            29.99,
            24,
            'test-token-789'
          );
          addResult('success', 'Admin overdue payment notification sent');
          break;

        default:
          addResult('error', 'Unknown test type');
      }
    } catch (error) {
      addResult('error', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4 text-blue-500" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      default:
        return 'primary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center space-x-2">
        <TestTube className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Email System Testing</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Test Type"
            selectedKeys={[testType]}
            onSelectionChange={(keys) => setTestType(Array.from(keys)[0] as string)}
          >
            <SelectItem key="connection" startContent={<Mail className="h-4 w-4" />}>
              Connection Test
            </SelectItem>
            <SelectItem key="custom" startContent={<Send className="h-4 w-4" />}>
              Custom Email
            </SelectItem>
            <SelectItem key="welcome" startContent={<User className="h-4 w-4" />}>
              Welcome Email
            </SelectItem>
            <SelectItem key="purchase" startContent={<CreditCard className="h-4 w-4" />}>
              Purchase Confirmation
            </SelectItem>
            <SelectItem key="reminder" startContent={<AlertTriangle className="h-4 w-4" />}>
              Registration Reminder
            </SelectItem>
            <SelectItem key="admin-registration" startContent={<User className="h-4 w-4" />}>
              Admin: New Registration
            </SelectItem>
            <SelectItem key="admin-purchase" startContent={<CreditCard className="h-4 w-4" />}>
              Admin: New Purchase
            </SelectItem>
            <SelectItem key="admin-overdue" startContent={<AlertTriangle className="h-4 w-4" />}>
              Admin: Overdue Payment
            </SelectItem>
          </Select>

          {testType !== 'connection' && (
            <Input
              label="Test Email Address"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              isRequired
            />
          )}
        </div>

        {testType === 'custom' && (
          <div className="space-y-3">
            <Input
              label="Subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Email subject"
            />
            <Textarea
              label="Message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Email message content"
              minRows={3}
            />
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            color="primary"
            startContent={<Send className="h-4 w-4" />}
            onPress={runTest}
            isLoading={testing}
            isDisabled={testing || (!testEmail && testType !== 'connection')}
          >
            {testing ? 'Running Test...' : 'Run Test'}
          </Button>
          
          {results.length > 0 && (
            <Button
              variant="flat"
              onPress={clearResults}
            >
              Clear Results
            </Button>
          )}
        </div>

        {results.length > 0 && (
          <>
            <Divider />
            <div>
              <h4 className="font-semibold mb-3">Test Results</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {getResultIcon(result.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Chip
                          size="sm"
                          color={getResultColor(result.type) as any}
                          variant="flat"
                        >
                          {result.type.toUpperCase()}
                        </Chip>
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Divider />
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Testing Guidelines</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Connection Test:</strong> Verifies SMTP configuration without sending emails</li>
            <li>• <strong>Custom Email:</strong> Sends a test email with your custom content</li>
            <li>• <strong>Welcome Email:</strong> Tests the user registration email template</li>
            <li>• <strong>Purchase Confirmation:</strong> Tests the purchase confirmation email</li>
            <li>• <strong>Registration Reminder:</strong> Tests overdue payment reminders</li>
            <li>• <strong>Admin Notifications:</strong> Tests admin alert emails</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}