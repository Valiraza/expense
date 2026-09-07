import api from './api';

export interface Income {
  _id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  notes?: string;
  userId: string;
}

export const getIncomes = async () => {
  const { data } = await api.get('/incomes');
  return data;
};

export const createIncome = async (income: Omit<Income, '_id' | 'userId'>) => {
  const { data } = await api.post('/incomes', income);
  return data;
};

export const updateIncome = async (id: string, income: Partial<Omit<Income, '_id' | 'userId'>>) => {
  const { data } = await api.put(`/incomes/${id}`, income);
  return data;
};

export const deleteIncome = async (id: string) => {
  const { data } = await api.delete(`/incomes/${id}`);
  return data;
};
