import api from './api';

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  paymentMethod?: string;
  notes?: string;
  userId: string;
}

export const getExpenses = async () => {
  const { data } = await api.get('/expenses');
  return data;
};

export const createExpense = async (expense: Omit<Expense, '_id' | 'userId'>) => {
  const { data } = await api.post('/expenses', expense);
  return data;
};

export const updateExpense = async (id: string, expense: Partial<Omit<Expense, '_id' | 'userId'>>) => {
  const { data } = await api.put(`/expenses/${id}`, expense);
  return data;
};

export const deleteExpense = async (id: string) => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
};
