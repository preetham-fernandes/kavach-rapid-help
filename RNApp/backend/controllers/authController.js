import supabase from '../supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Manual signup (no supabase.auth used)
export const signup = async (req, res) => {
  const {
    email,
    password,
    fullName,
    aadhaarNumber,
    mobileNumber,
    emergencyContact,
    address,
    gender,
    age
  } = req.body;

  try {
    // Check if email already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('app_users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('app_users')
      .insert({
        email,
        password: hashedPassword,
        full_name: fullName,
        aadhaar_number: aadhaarNumber,
        mobile_number: mobileNumber,
        emergency_contact: emergencyContact,
        address,
        gender,
        age
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create tokens
    const token = jwt.sign({ userId: data.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: data.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token
    await supabase.from('user_tokens').insert({
      user_id: data.id,
      token: refreshToken
    });

    return res.status(200).json({
      message: 'Signup successful!',
      user: data,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Invalid email or user not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create tokens
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token
    await supabase.from('user_tokens').insert({
      user_id: user.id,
      token: refreshToken
    });


    return res.status(200).json({
      message: 'Login successful',
      user,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  
  if (refreshToken) {
    // Remove refresh token from database
    await supabase
      .from('user_tokens')
      .delete()
      .eq('token', refreshToken);
  }
  
  return res.status(200).json({ message: 'Logged out successfully' });
};
