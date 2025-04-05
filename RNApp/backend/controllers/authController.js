import supabase from '../supabase.js';
import bcrypt from 'bcryptjs';

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

  await supabase.from('aadhaar_verifications').insert({
    user_id: data.id,
    aadhaar_number: aadhaarNumber,
    verification_status: 'pending'
  });

  return res.status(200).json({ message: 'Signup successful!', user: data });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

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

  return res.status(200).json({ message: 'Login successful', user });
};

export const logout = async (req, res) => {
  // No supabase.auth session to destroy
  return res.status(200).json({ message: 'Logged out (client handles session)' });
};
