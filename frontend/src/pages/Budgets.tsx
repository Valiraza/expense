import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import ProgressBar from '../components/common/ProgressBar';
import { getBudgets, createBudget, updateBudget, deleteBudget, Budget } from '../services/budgetService';
import { useNavigate } from 'react-router-dom';
import { formatMGA } from '../utils/formatCurrency';
import { FormFeedback } from '../components/common/FormFeedback';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget> | null>(null);
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      else setGlobalError('Erreur lors du chargement des budgets.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
      try {
        await deleteBudget(id);
        setSuccessMessage('Budget supprimé avec succès.');
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
    
    const amountVal = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const monthVal = (form.elements.namedItem('month') as HTMLInputElement).value;
    const yearVal = (form.elements.namedItem('year') as HTMLInputElement).value;

    const errors: Record<string, string> = {};
    if (!amountVal || parseFloat(amountVal) <= 0) errors.amount = 'Le montant doit être supérieur à 0.';
    if (!monthVal || parseInt(monthVal) < 1 || parseInt(monthVal) > 12) errors.month = 'Veuillez saisir un mois valide (1-12).';
    if (!yearVal || yearVal.length !== 4) errors.year = 'Veuillez saisir une année valide.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const amount = parseFloat(amountVal);
      const month = parseInt(monthVal);
      const year = parseInt(yearVal);

      if (currentBudget && currentBudget._id) {
        await updateBudget(currentBudget._id, { amount, month, year });
        setSuccessMessage('Budget mis à jour avec succès.');
      } else {
        await createBudget({ amount, month, year });
        setSuccessMessage('Budget créé avec succès.');
      }
      setIsFormOpen(false);
      setCurrentBudget(null);
      fetchBudgets();
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else setGlobalError(error.response?.data?.message || 'Impossible d\'enregistrer le budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Budgets" 
        description="Gérez vos limites de dépenses" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentBudget(null); setFormErrors({}); setIsFormOpen(true); }}>+ Créer</button>} 
      />

      {successMessage && <FormFeedback message={successMessage} type="success" />}
      {globalError && <FormFeedback message={globalError} type="error" />}

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
            
            <div className="relative mb-1">
              <input name="amount" type="number" defaultValue={currentBudget?.amount} placeholder="Montant limite" className={`border p-2 w-full rounded pr-12 ${formErrors.amount ? 'border-red-500' : ''}`} />
              <span className="absolute right-3 top-2.5 text-gray-500">Ar</span>
            </div>
            {formErrors.amount && <p className="text-red-500 text-xs mb-2">{formErrors.amount}</p>}
            
            <input name="month" type="number" defaultValue={currentBudget?.month || new Date().getMonth() + 1} placeholder="Mois (1-12)" className={`border p-2 mb-1 w-full rounded ${formErrors.month ? 'border-red-500' : ''}`} />
            {formErrors.month && <p className="text-red-500 text-xs mb-2">{formErrors.month}</p>}
            
            <input name="year" type="number" defaultValue={currentBudget?.year || new Date().getFullYear()} placeholder="Année (ex: 2026)" className={`border p-2 mb-1 w-full rounded ${formErrors.year ? 'border-red-500' : ''}`} />
            {formErrors.year && <p className="text-red-500 text-xs mb-4">{formErrors.year}</p>}
            
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100" onClick={() => setIsFormOpen(false)}>Annuler</button>
              <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
