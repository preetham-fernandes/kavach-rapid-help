import express from 'express';
import { submitReport, sendEmergencySMS } from '../controllers/reportController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', auth, submitReport);
router.post('/emergency', auth, sendEmergencySMS);

export default router;