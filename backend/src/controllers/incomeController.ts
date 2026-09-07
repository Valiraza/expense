import { Request, Response } from 'express';
import Income from '../models/Income';

export const getIncomes = async (req: Request, res: Response) => {
  const incomes = await Income.find({ userId: (req as any).user.id });
  res.json(incomes);
};

export const createIncome = async (req: Request, res: Response) => {
  const income = await Income.create({ ...req.body, userId: (req as any).user.id });
  res.status(201).json(income);
};

export const updateIncome = async (req: Request, res: Response) => {
  const income = await Income.findOneAndUpdate(
    { _id: req.params.id, userId: (req as any).user.id },
    req.body,
    { new: true }
  );

  if (!income) return res.status(404).json({ message: 'Income not found' });
  res.json(income);
};

export const deleteIncome = async (req: Request, res: Response) => {
  const income = await Income.findOneAndDelete({ _id: req.params.id, userId: (req as any).user.id });
  if (!income) return res.status(404).json({ message: 'Income not found' });
  res.json({ message: 'Income removed' });
};
