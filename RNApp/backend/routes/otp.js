// routes/otp.js
import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();
const router = express.Router();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("Token:", process.env.TWILIO_AUTH_TOKEN ? "Loaded ✅" : "Missing ❌");
console.log("Service SID:", process.env.TWILIO_SERVICE_SID);

// Helper function to validate phone number format
const validatePhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's an Indian number (10 digits + optional country code)
  if (cleaned.length === 10) {
    return `+91${cleaned}`; // Add India country code
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  } else if (cleaned.length > 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }
  return null;
};

// Send OTP
router.post('/send', async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  // Validate and format phone number
  const formattedMobile = validatePhoneNumber(mobile);
  if (!formattedMobile) {
    return res.status(400).json({ error: 'Invalid mobile number format. Please use format: 9876543210 or +919876543210' });
  }

  try {
    const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({ 
        to: formattedMobile, 
        channel: 'sms' 
      });

    res.status(200).json({ 
      message: 'OTP sent successfully', 
      sid: verification.sid,
      mobile: formattedMobile // Return formatted number for verification
    });
  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error.message 
    });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: 'Mobile number and OTP are required' });
  }

  // Validate and format phone number
  const formattedMobile = validatePhoneNumber(mobile);
  if (!formattedMobile) {
    return res.status(400).json({ error: 'Invalid mobile number format' });
  }

  try {
    const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks
      .create({ 
        to: formattedMobile, 
        code: otp 
      });

    if (verificationCheck.status === 'approved') {
      return res.status(200).json({ 
        message: 'OTP verified successfully',
        verified: true
      });
    } else {
      return res.status(400).json({ 
        error: 'Invalid OTP',
        verified: false
      });
    }
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ 
      error: 'Failed to verify OTP',
      details: error.message
    });
  }
});

export default router;