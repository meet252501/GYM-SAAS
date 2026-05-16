const emailService = require('./src/services/email.service');

async function testEmailAutomation() {
  console.log('--- 📧 Testing Email Automation Logic (Manual Mock) ---');
  
  let mailSentCount = 0;
  const originalSendMail = emailService.transporter.sendMail;
  
  // Manual mock
  emailService.transporter.sendMail = async (options) => {
    mailSentCount++;
    console.log(`[MOCK] Sending email: ${options.subject} to ${options.to}`);
    return { messageId: 'test-id-' + mailSentCount };
  };

  try {
    // 1. Test Welcome Email
    console.log('Testing Welcome Email...');
    await emailService.sendWelcomeEmail({ firstName: 'TestUser', email: 'test@gymflow.io' });

    // 2. Test Password Reset Email
    console.log('Testing Password Reset Email...');
    await emailService.sendPasswordResetEmail({ email: 'reset@gymflow.io' }, '123456');

    if (mailSentCount === 2) {
      console.log('✅ PASS: Exactly 2 emails were dispatched.');
    } else {
      console.log(`❌ FAIL: Expected 2 emails, got ${mailSentCount}`);
    }

  } catch (err) {
    console.error('❌ Email test failed:', err);
  } finally {
    // Restore
    emailService.transporter.sendMail = originalSendMail;
  }
}

testEmailAutomation();
