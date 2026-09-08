import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/dashboard/StatCard';
import { LayoutDashboard, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatMGA } from '../utils/formatCurrency';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (error: any) {
        if (error.response?.status === 401) navigate('/login');
        else alert(error.response?.data?.message || 'Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!data) return null;

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Vue d'ensemble</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Solde Actuel" value={formatMGA(data.balance ?? 0)} color="text-indigo-600" icon={<Wallet />} />
        <StatCard title="Total Revenus" value={formatMGA(data.totalIncomes ?? 0)} color="text-green-600" icon={<TrendingUp />} />
        <StatCard title="Total Dépenses" value={formatMGA(data.totalExpenses ?? 0)} color="text-red-600" icon={<TrendingDown />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Dépenses par catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.categoryStats} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={(entry: any) => entry.category}>
                {data.categoryStats.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatMGA(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Dernières transactions</h3>
          <ul className="space-y-4">
            {data.recentTransactions.map((t: any) => (
              <li key={t._id} className="flex justify-between border-b pb-2">
                <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <span className={`font-bold ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                    {t.type === 'expense' ? '-' : '+'}{formatMGA(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
