//server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import otpRoutes from './routes/otp.js'; 
import sosRoutes from './routes/sos.js';
import reportRoutes from './routes/report.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/sos',sosRoutes)
app.use('/api/report', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
