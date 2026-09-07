import { Request, Response } from 'express';
import Category from '../models/Category';

export const getCategories = async (req: Request, res: Response) => {
  const categories = await Category.find({ userId: (req as any).user.id });
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const category = await Category.create({ ...req.body, userId: (req as any).user.id });
  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: (req as any).user.id },
    req.body,
    { new: true }
  );
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, userId: (req as any).user.id });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category removed' });
};
