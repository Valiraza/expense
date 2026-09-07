import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Income from '../models/Income';
import mongoose from 'mongoose';

export const getDashboardData = async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId((req as any).user.id);

  const [expenses, incomes] = await Promise.all([
    Expense.find({ userId }),
    Income.find({ userId })
  ]);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  // Stats par catégorie
  const expensesByCategory = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const categoryStats = Object.keys(expensesByCategory).map(category => ({
    category,
    amount: expensesByCategory[category]
  }));

  // Dernières transactions (5 dernières)
  const recentTransactions = await Expense.find({ userId })
    .sort({ date: -1 })
    .limit(5);

  res.json({
    balance: totalIncomes - totalExpenses,
    totalExpenses,
    totalIncomes,
    categoryStats,
    recentTransactions
  });
};
