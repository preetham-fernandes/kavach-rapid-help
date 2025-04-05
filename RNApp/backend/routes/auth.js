//routes/auth.js
import express from 'express';
import { signup, login, logout } from '../controllers/authController.js';
import { getUserProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);


// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

export default router;
