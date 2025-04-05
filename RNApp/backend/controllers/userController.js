import supabase from '../supabase.js';

export const getUserProfile = async (req, res) => {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
};

export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('app_users')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
};