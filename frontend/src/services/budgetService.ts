import api from './api';

export interface Budget {
  _id: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  userId: string;
}

export const getBudgets = async () => {
  const { data } = await api.get('/budgets');
  return data;
};

export const createBudget = async (budget: Omit<Budget, '_id' | 'spent' | 'remaining' | 'percentageUsed' | 'userId'>) => {
  const { data } = await api.post('/budgets', budget);
  return data;
};

export const updateBudget = async (id: string, budget: Partial<Omit<Budget, '_id' | 'spent' | 'remaining' | 'percentageUsed' | 'userId'>>) => {
  const { data } = await api.put(`/budgets/${id}`, budget);
  return data;
};

export const deleteBudget = async (id: string) => {
  const { data } = await api.delete(`/budgets/${id}`);
  return data;
};
