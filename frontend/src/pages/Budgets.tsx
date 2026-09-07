import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import ProgressBar from '../components/common/ProgressBar';
import { getBudgets, createBudget, updateBudget, deleteBudget, Budget } from '../services/budgetService';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <PageHeader 
        title="Budgets" 
        description="Gérez vos limites de dépenses" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentBudget(null); setIsFormOpen(true); }}>+ Créer un budget</button>} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map(budget => (
          <div key={budget._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Budget {budget.month}/{budget.year}</h3>
                <p className="text-sm text-gray-500">Limite: {budget.amount} €</p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600" onClick={() => { setCurrentBudget(budget); setIsFormOpen(true); }}>Modifier</button>
                <button className="text-red-600" onClick={() => handleDelete(budget._id)}>Supprimer</button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dépensé: {budget.spent.toFixed(2)} €</span>
                <span>Restant: {budget.remaining.toFixed(2)} €</span>
              </div>
              <ProgressBar value={budget.spent} max={budget.amount} />
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form className="bg-white p-6 rounded-lg shadow-lg" onSubmit={handleSave}>
            <h2 className="text-lg font-bold mb-4">{currentBudget ? 'Modifier' : 'Créer'} un budget</h2>
            <input name="amount" type="number" defaultValue={currentBudget?.amount} placeholder="Montant" className="border p-2 mb-2 w-full" required />
            <input name="month" type="number" defaultValue={currentBudget?.month || new Date().getMonth() + 1} placeholder="Mois" className="border p-2 mb-2 w-full" required />
            <input name="year" type="number" defaultValue={currentBudget?.year || new Date().getFullYear()} placeholder="Année" className="border p-2 mb-4 w-full" required />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsFormOpen(false)}>Annuler</button>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
