import jwt from 'jsonwebtoken';
import supabase from '../supabase.js';

export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized - No token provided' });
    
    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user exists in database
        const { data: user, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Verify refresh token exists in database
        const { data: tokenRecord, error } = await supabase
            .from('user_tokens')
            .select('*')
            .eq('user_id', decoded.userId)
            .eq('token', refreshToken)
            .single();

        if (error || !tokenRecord) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ 
            token: newAccessToken,
            user: { id: decoded.userId }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
};