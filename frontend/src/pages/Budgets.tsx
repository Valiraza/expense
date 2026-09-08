import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import ProgressBar from '../components/common/ProgressBar';
import { getBudgets, createBudget, updateBudget, deleteBudget, Budget } from '../services/budgetService';
import { useNavigate } from 'react-router-dom';
import { formatMGA } from '../utils/formatCurrency';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await getBudgets();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else alert('Erreur lors du chargement des budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
      try {
        await deleteBudget(id);
        fetchBudgets();
      } catch (error: any) {
        if (error.response?.status === 401) navigate('/login');
        else alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const month = parseInt((form.elements.namedItem('month') as HTMLInputElement).value);
    const year = parseInt((form.elements.namedItem('year') as HTMLInputElement).value);

    try {
      if (currentBudget && currentBudget._id) {
        await updateBudget(currentBudget._id, { amount, month, year });
      } else {
        await createBudget({ amount, month, year });
      }
      setIsFormOpen(false);
      setCurrentBudget(null);
      fetchBudgets();
      } catch (error: any) {
        if (error.response?.status === 401) navigate('/login');
        else alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      }
    };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Budgets" 
        description="Gérez vos limites de dépenses" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentBudget(null); setIsFormOpen(true); }}>+ Créer</button>} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(budget => (
          <div key={budget._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Budget {budget.month}/{budget.year}</h3>
                <p className="text-sm text-gray-500">Limite: {formatMGA(budget.amount)}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => { setCurrentBudget(budget); setIsFormOpen(true); }}>Modif</button>
                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(budget._id)}>Suppr</button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dépensé: {formatMGA(budget.spent)}</span>
                <span className={budget.remaining < 0 ? 'text-red-600 font-bold' : ''}>
                  Restant: {formatMGA(budget.remaining)}
                </span>
              </div>
              <ProgressBar value={budget.spent} max={budget.amount} />
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSave}>
            <h2 className="text-lg font-bold mb-4">{currentBudget ? 'Modifier' : 'Créer'} un budget</h2>
            
            <div className="relative mb-4">
              <input name="amount" type="number" defaultValue={currentBudget?.amount} placeholder="Montant limite" className="border p-2 w-full rounded pr-12" required />
              <span className="absolute right-3 top-2.5 text-gray-500">Ar</span>
            </div>
            <input name="month" type="number" defaultValue={currentBudget?.month || new Date().getMonth() + 1} placeholder="Mois" className="border p-2 mb-2 w-full rounded" required />
            <input name="year" type="number" defaultValue={currentBudget?.year || new Date().getFullYear()} placeholder="Année" className="border p-2 mb-4 w-full rounded" required />
            
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100" onClick={() => setIsFormOpen(false)}>Annuler</button>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
