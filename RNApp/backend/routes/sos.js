import express from 'express';
import twilio from 'twilio';
import dotenv from 'dotenv';

const router = express.Router();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Utility function to validate and format phone number
function validatePhoneNumber(number) {
  // Basic check (improve as needed)
  const cleaned = number.replace(/\D/g, '');
  return cleaned.length >= 10 ? `+91${cleaned.slice(-10)}` : null;
}

// POST /send-sos
router.post('/send-sos', async (req, res) => {
  try {
    const { contactNumber, location, userId, userEmail } = req.body;

    if (!contactNumber) {
      return res.status(400).json({ error: 'Emergency contact number is required' });
    }

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ error: 'Location data is required' });
    }

    const formattedNumber = validatePhoneNumber(contactNumber);
    if (!formattedNumber) {
      return res.status(400).json({ error: 'Invalid emergency contact number format' });
    }

    const mapsLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

    const message = `This is a test message
User ${userEmail || userId} needs ur assistance!

Location: ${location.address || 'Unknown address'}
Coordinates: ${location.latitude}, ${location.longitude}
Map: ${mapsLink}

Time: ${new Date().toLocaleString()}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log('SOS message sent:', result.sid);
    res.status(200).json({ success: true, message: 'SOS alert sent successfully' });
  } catch (error) {
    console.error('Error sending SOS:', error);
    res.status(500).json({ error: 'Failed to send SOS alert', details: error.message });
  }
});

export default router;
