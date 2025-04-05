//auth middleware
import supabase from '../supabase.js'; // ✅ Import properly

const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase.auth.getUser(token);

    if (error) return res.status(401).json({ error: 'Invalid token' });

    req.user = data.user;
    next();
};

export { protect }; // ✅ Exporting as named export
