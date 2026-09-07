import { Request, Response } from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';
import Joi from 'joi';

export const getBudgets = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const budgets = await Budget.find({ userId });
  
  const budgetsWithCalculations = await Promise.all(
    budgets.map(async (budget) => {
      const startOfMonth = new Date(budget.year, budget.month - 1, 1);
      const endOfMonth = new Date(budget.year, budget.month, 0, 23, 59, 59);

      const expenses = await Expense.find({
        userId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const spent = expenses.reduce((acc, exp) => acc + exp.amount, 0);
      const remaining = budget.amount - spent;
      const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        ...budget.toObject(),
        spent,
        remaining,
        percentageUsed
      };
    })
  );

  res.json(budgetsWithCalculations);
};

export const createBudget = async (req: Request, res: Response) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { amount, month, year } = req.body;
  const userId = (req as any).user.id;

  const existingBudget = await Budget.findOne({ userId, month, year });
  if (existingBudget) {
    return res.status(400).json({ message: 'Budget already exists for this month and year' });
  }

  const budget = await Budget.create({ userId, amount, month, year });
  res.status(201).json(budget);
};

export const updateBudget = async (req: Request, res: Response) => {
  const schema = Joi.object({
    amount: Joi.number().positive(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, userId: (req as any).user.id },
    req.body,
    { new: true }
  );

  if (!budget) return res.status(404).json({ message: 'Budget not found' });
  res.json(budget);
};

export const deleteBudget = async (req: Request, res: Response) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: (req as any).user.id });
  if (!budget) return res.status(404).json({ message: 'Budget not found' });
  res.json({ message: 'Budget removed' });
};
