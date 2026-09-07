import express from 'express';
import { getIncomes, createIncome, updateIncome, deleteIncome } from '../controllers/incomeController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.use(protect);
router.route('/').get(getIncomes).post(createIncome);
router.route('/:id').put(updateIncome).delete(deleteIncome);
export default router;
