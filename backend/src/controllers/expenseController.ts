import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Category from '../models/Category';
import Joi from 'joi';

export const getExpenses = async (req: Request, res: Response) => {
  const { category, startDate, endDate } = req.query;
  const filter: any = { userId: (req as any).user.id };

  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate as string);
    if (endDate) filter.date.$lte = new Date(endDate as string);
  }

  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json(expenses);
};

export const getExpense = async (req: Request, res: Response) => {
  const expense = await Expense.findOne({ _id: req.params.id, userId: (req as any).user.id });
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
};

export const createExpense = async (req: Request, res: Response) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required(),
    category: Joi.string().required(),
    description: Joi.string().max(255),
    date: Joi.date().default(Date.now),
    paymentMethod: Joi.string(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // Vérifier si la catégorie appartient à l'utilisateur
  const categoryExists = await Category.findOne({ 
    _id: req.body.category, // Assuming category is passed as an ID
    userId: (req as any).user.id 
  });
  if (!categoryExists) return res.status(400).json({ message: 'Invalid category' });

  const expense = await Expense.create({ ...req.body, userId: (req as any).user.id });
  res.status(201).json(expense);
};

export const updateExpense = async (req: Request, res: Response) => {
  const schema = Joi.object({
    amount: Joi.number().positive(),
    category: Joi.string(),
    description: Joi.string().max(255),
    date: Joi.date(),
    paymentMethod: Joi.string(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: (req as any).user.id },
    req.body,
    { new: true }
  );

  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
};

export const deleteExpense = async (req: Request, res: Response) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: (req as any).user.id });
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json({ message: 'Expense removed' });
};
