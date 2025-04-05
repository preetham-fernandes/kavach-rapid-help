///THIS IS FOR SOS (NOT WORST CASE SCENARIO)
import express from 'express';
import { submitReport, sendEmergencySMS } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', protect, submitReport);
router.post('/emergency', protect, sendEmergencySMS);

export default router;