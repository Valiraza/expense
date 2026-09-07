import express from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.get('/', protect, getDashboardData);
export default router;
