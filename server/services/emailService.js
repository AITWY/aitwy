import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    // Check if real email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      // Use real email service
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      console.log('📧 Email service configured:', process.env.EMAIL_SERVICE || 'gmail');
    } else {
      // Development: Use ethereal email (fake SMTP for testing)
      console.log('⚠️  No email credentials found. Using Ethereal (fake SMTP) for testing.');
      console.log('💡 To use real emails, set EMAIL_USER and EMAIL_PASSWORD in server/.env');
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Test email account created:', testAccount.user);
    } catch (error) {
      console.error('Failed to create test email account:', error);
    }
  }

  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AITWY" <noreply@aitwy.com>',
      to: user.email,
      subject: 'Verify Your Email - AITWY',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AITWY!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name},</h2>
              <p>Thank you for signing up! We're excited to have you on board.</p>
              <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #fff; padding: 10px; border: 1px solid #ddd; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours.
              </div>
              
              <p>If you didn't create an account with AITWY, please ignore this email.</p>
              
              <p>Best regards,<br>The AITWY Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AITWY. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${user.name},
        
        Thank you for signing up for AITWY!
        
        To complete your registration and activate your account, please verify your email address by clicking the link below:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours.
        
        If you didn't create an account with AITWY, please ignore this email.
        
        Best regards,
        The AITWY Team
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Verification email sent to:', user.email);
      
      // Show preview URL only for Ethereal
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📬 Preview URL:', previewUrl);
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AITWY" <noreply@aitwy.com>',
      to: user.email,
      subject: 'Welcome to AITWY - Your Account is Active!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to AITWY!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name},</h2>
              <p>Your email has been verified and your account is now active!</p>
              <p>You can now access all features of AITWY.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
              </div>
              
              <h3>What's Next?</h3>
              <div class="feature">
                <strong>✨ Explore Features</strong><br>
                Discover all the amazing features AITWY has to offer.
              </div>
              <div class="feature">
                <strong>🔒 Secure Your Account</strong><br>
                Make sure to use a strong password and keep it safe.
              </div>
              <div class="feature">
                <strong>📧 Stay Updated</strong><br>
                We'll keep you informed about new features and updates.
              </div>
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
              
              <p>Best regards,<br>The AITWY Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AITWY. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${user.name},
        
        Your email has been verified and your account is now active!
        
        You can now login and access all features of AITWY.
        
        Login here: ${process.env.FRONTEND_URL}/login
        
        Best regards,
        The AITWY Team
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Welcome email sent to:', user.email);
      
      // Show preview URL only for Ethereal
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📬 Preview URL:', previewUrl);
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email - it's not critical
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();

