const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Nodemailer transporter
let transporter = null;
const isEmailConfigured = 
  process.env.SMTP_HOST && 
  process.env.SMTP_USER && 
  process.env.SMTP_PASS &&
  !process.env.SMTP_USER.includes('placeholder') &&
  !process.env.SMTP_USER.includes('your-email');

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  // Verify configuration
  transporter.verify((error) => {
    if (error) {
      console.warn('❌ Nodemailer verification failed:', error.message);
    } else {
      console.log('⚡ Nodemailer is ready to send emails');
    }
  });
} else {
  console.log('ℹ️ Nodemailer is in sandbox mode. Emails will be logged to console.');
}

// Initialize Twilio client
let twilioClient = null;
const isTwilioConfigured = 
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_PHONE_NUMBER &&
  !process.env.TWILIO_ACCOUNT_SID.includes('placeholder') &&
  !process.env.TWILIO_ACCOUNT_SID.includes('your_twilio');

if (isTwilioConfigured) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('⚡ Twilio SMS client initialized');
  } catch (error) {
    console.warn('❌ Failed to initialize Twilio client:', error.message);
  }
} else {
  console.log('ℹ️ Twilio is in sandbox mode. SMS OTPs will be logged to console.');
}

/**
 * Send Email OTP
 * @param {string} toEmail 
 * @param {string} code 
 */
const sendEmailOTP = async (toEmail, code) => {
  const subject = 'ShopEase - Verify Your Email';
  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, sans-serif; background-color: #0f0f12; color: #f3f4f6; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
      <h2 style="color: #8b5cf6; font-size: 24px; font-weight: 700; margin-bottom: 20px; text-align: center;">Verify Your Account</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #9ca3af;">Thank you for registering with ShopEase! To complete your registration and secure your account, please use the following one-time password (OTP):</p>
      
      <div style="background: linear-gradient(135deg, #8b5cf6, #d946ef); padding: 15px; border-radius: 12px; text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 6px;">${code}</span>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 10 minutes. If you did not request this verification code, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 30px 0;" />
      <p style="font-size: 12px; color: #4b5563; text-align: center;">&copy; 2026 ShopEase Inc. All rights reserved.</p>
    </div>
  `;

  if (isEmailConfigured && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"ShopEase" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`✉️ Email OTP sent to ${toEmail}`);
    } catch (error) {
      console.error(`❌ Failed to send Email OTP to ${toEmail}:`, error.message);
      throw new Error('Could not send email OTP. Please check server config.');
    }
  } else {
    console.log('\n====================================');
    console.log(`✉️ EMAIL OTP FOR ${toEmail}: [ ${code} ]`);
    console.log('====================================\n');
  }
};

/**
 * Send SMS OTP
 * @param {string} phoneNumber 
 * @param {string} code 
 */
const sendSMSOTP = async (phoneNumber, code) => {
  const messageBody = `ShopEase: Your phone verification OTP code is ${code}. Valid for 10 minutes.`;

  let formattedNumber = phoneNumber.trim();
  if (!formattedNumber.startsWith('+')) {
    formattedNumber = `+91${formattedNumber}`;
  }

  if (isTwilioConfigured && twilioClient) {
    try {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber,
      });
      console.log(`📱 SMS OTP sent to ${formattedNumber}`);
    } catch (error) {
      console.error(`❌ Failed to send SMS OTP to ${formattedNumber}:`, error.message);
      throw new Error(`Could not send SMS OTP: ${error.message}`);
    }
  } else {
    console.log('\n====================================');
    console.log(`📱 SMS OTP FOR ${formattedNumber}: [ ${code} ]`);
    console.log('====================================\n');
  }
};

/**
 * Send a professional Welcome Email
 * @param {string} toEmail 
 * @param {string} name 
 */
const sendWelcomeEmail = async (toEmail, name) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
  const subject = 'Welcome to ShopEase! Explore our Premium Catalog';
  const htmlContent = `
    <div style="font-family: 'Inter', system-ui, sans-serif; background-color: #050505; color: #f3f4f6; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1); background-image: radial-gradient(circle at 15% 50%, rgba(139, 92, 246, 0.1), transparent 25%);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.03em; margin: 0;">
          <span style="background: linear-gradient(135deg, #8b5cf6, #d946ef); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ShopEase</span>
        </h1>
      </div>
      
      <h2 style="font-size: 22px; font-weight: 600; color: #ffffff; margin-bottom: 20px;">Welcome to the future of shopping, ${name}!</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-bottom: 20px;">
        We are thrilled to welcome you to <strong>ShopEase</strong>, your premier destination for the finest curated selection of electronics, fashion, home essentials, and books.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-bottom: 20px;">
        To celebrate your arrival, we have credited your account with exclusive access to our newest catalog, lightning-fast secure checkouts, and priority support.
      </p>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin: 30px 0;">
        <h3 style="font-size: 18px; color: #8b5cf6; margin-top: 0; margin-bottom: 10px;">🌟 What you can do next:</h3>
        <ul style="color: #9ca3af; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Explore our curated <a href="${frontendUrl}" style="color: #d946ef; text-decoration: none; font-weight: 500;">Premium Catalog</a></li>
          <li>Customize your profile and shipping preferences</li>
          <li>Avail of free express shipping on your very first order</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="${frontendUrl}" style="background: linear-gradient(135deg, #8b5cf6, #d946ef); color: #ffffff; padding: 14px 30px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; display: inline-block; transition: transform 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);">
          Start Shopping Now
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 30px 0;" />
      
      <p style="font-size: 13px; color: #6b7280; text-align: center; line-height: 1.5;">
        You received this email because you recently signed up for a ShopEase account. If this wasn't you, please contact our support team.
      </p>
      
      <p style="font-size: 12px; color: #4b5563; text-align: center; margin-top: 20px;">
        &copy; 2026 ShopEase Inc. • 123 Innovation Boulevard, Suite 500
      </p>
    </div>
  `;

  if (isEmailConfigured && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"ShopEase" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`✉️ Welcome email successfully sent to ${toEmail}`);
    } catch (error) {
      console.error(`❌ Failed to send Welcome Email to ${toEmail}:`, error.message);
      // Don't throw error here to avoid breaking the login process
    }
  } else {
    console.log('\n====================================');
    console.log(`✉️ WELCOME EMAIL SENT TO ${toEmail} (${name})`);
    console.log('====================================\n');
  }
};

module.exports = {
  sendEmailOTP,
  sendSMSOTP,
  sendWelcomeEmail
};
