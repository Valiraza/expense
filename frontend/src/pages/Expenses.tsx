import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import { getExpenses, createExpense, updateExpense, deleteExpense, Expense } from '../services/expenseService';
import { getCategories, Category } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';
import { formatMGA } from '../utils/formatCurrency';
import { FormFeedback } from '../components/common/FormFeedback';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData] = await Promise.all([getExpenses(), getCategories()]);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else setGlobalError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else setGlobalError('Erreur lors du rechargement des dépenses.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        await deleteExpense(id);
        setSuccessMessage('Dépense supprimée avec succès.');
        fetchExpenses();
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
    const description = (form.elements.namedItem('description') as HTMLInputElement).value;
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value;

    const errors: Record<string, string> = {};
    if (!description.trim()) errors.description = 'Ce champ est obligatoire.';
    if (!amountVal || parseFloat(amountVal) <= 0) errors.amount = 'Le montant doit être supérieur à 0.';
    if (!category) errors.category = 'Veuillez sélectionner une catégorie.';
    
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
      if (currentExpense && currentExpense._id) {
        await updateExpense(currentExpense._id, { amount, description, category });
        setSuccessMessage('Dépense mise à jour avec succès.');
      } else {
        await createExpense({ amount, description, category, date: new Date() });
        setSuccessMessage('Dépense créée avec succès.');
      }
      setIsFormOpen(false);
      setCurrentExpense(null);
      fetchExpenses();
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else setGlobalError('Impossible d\'enregistrer la dépense. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dépenses" 
        description="Gérez vos dépenses" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentExpense(null); setFormErrors({}); setIsFormOpen(true); }}>+ Créer</button>} 
      />
      
      {successMessage && <FormFeedback message={successMessage} type="success" />}
      {globalError && <FormFeedback message={globalError} type="error" />}

      <div className="md:hidden space-y-4">
        {expenses.map((e) => (
          <div key={e._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-bold">{e.description}</p>
              <p className="text-sm text-gray-500">{categories.find(c => c._id === e.category)?.name || e.category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-red-600">{formatMGA(e.amount)}</p>
              <div className="flex gap-2 mt-2">
                <button className="text-blue-600 text-sm" onClick={() => { setCurrentExpense(e); setIsFormOpen(true); }}>Modif</button>
                <button className="text-red-600 text-sm" onClick={() => handleDelete(e._id)}>Suppr</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <DataTable data={expenses} columns={[
            { header: 'Description', accessor: (e: Expense) => e.description },
            { header: 'Catégorie', accessor: (e: Expense) => categories.find(c => c._id === e.category)?.name || e.category },
            { header: 'Montant', accessor: (e: Expense) => formatMGA(e.amount) },
            { header: 'Actions', accessor: (e: Expense) => (
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => { setCurrentExpense(e); setIsFormOpen(true); }}>Modifier</button>
                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(e._id)}>Supprimer</button>
              </div>
            )},
        ]} />
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSave}>
            <h2 className="text-lg font-bold mb-4">{currentExpense ? 'Modifier' : 'Créer'} une dépense</h2>
            
            <input name="description" defaultValue={currentExpense?.description} placeholder="Description" className={`border p-2 mb-1 w-full rounded ${formErrors.description ? 'border-red-500' : ''}`} />
            {formErrors.description && <p className="text-red-500 text-xs mb-2">{formErrors.description}</p>}
            
            <select name="category" defaultValue={currentExpense?.category || categories.filter(c => c.type === 'expense')[0]?._id} className={`border p-2 mb-1 w-full rounded ${formErrors.category ? 'border-red-500' : ''}`}>
              {categories.filter(c => c.type === 'expense').map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {formErrors.category && <p className="text-red-500 text-xs mb-2">{formErrors.category}</p>}
            
            <div className="relative mb-1">
              <input name="amount" type="number" defaultValue={currentExpense?.amount} placeholder="Montant" className={`border p-2 w-full rounded pr-12 ${formErrors.amount ? 'border-red-500' : ''}`} />
              <span className="absolute right-3 top-2.5 text-gray-500">Ar</span>
            </div>
            {formErrors.amount && <p className="text-red-500 text-xs mb-4">{formErrors.amount}</p>}

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
