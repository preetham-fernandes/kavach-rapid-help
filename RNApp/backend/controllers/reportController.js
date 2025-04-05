import supabase from '../supabase.js';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const submitReport = async (req, res) => {
  try {
    const { audioUrl, location, userId, additionalDetails } = req.body;
    
    // Enhanced validation
    if (!audioUrl || !location || !userId) {
      return res.status(400).json({ 
        error: 'Audio, location, and user ID are required' 
      });
    }

    // Verify user exists first
    const { data: user, error: userError } = await supabase
      .from('app_users')
      .select('id, emergency_contact')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Insert report with enhanced data
    const { data, error } = await supabase
      .from('crime_reports')
      .insert({
        audio_url: audioUrl,
        location: {
          coordinates: location,
          address: await reverseGeocode(location) // Add this helper function
        },
        user_id: userId,
        details: additionalDetails,
        status: 'pending',
        emergency_contact: user.emergency_contact // Store contact for quick access
      })
      .select();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Report submitted successfully',
      report: data[0]
    });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
};

// Helper function for address lookup
async function reverseGeocode({ latitude, longitude }) {
  // Implement using a geocoding service or Supabase PostGIS
  return `Lat: ${latitude}, Long: ${longitude}`;
}

export const sendEmergencySMS = async (req, res) => {
  try {
    const { location, userId } = req.body;
    
    // Get user's emergency contact
    const { data: user, error } = await supabase
      .from('app_users')
      .select('emergency_contact')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = await twilioClient.messages.create({
      body: `🚨 EMERGENCY ALERT! User ID: ${userId}\n📍 Location: ${location.latitude},${location.longitude}\n🗺️ Map: https://maps.google.com/?q=${location.latitude},${location.longitude}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.emergency_contact // Use stored contact
    });

    // Update report status if exists
    await supabase
      .from('crime_reports')
      .update({ status: 'emergency_alert_sent' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    res.json({ 
      message: 'Emergency SMS sent successfully',
      sid: message.sid
    });
  } catch (error) {
    console.error('SMS Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to send emergency SMS'
    });
  }
};