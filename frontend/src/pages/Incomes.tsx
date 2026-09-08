import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import { getIncomes, createIncome, updateIncome, deleteIncome, Income } from '../services/incomeService';
import { getCategories, Category } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';
import { formatMGA } from '../utils/formatCurrency';
import { FormFeedback } from '../components/common/FormFeedback';

export default function Incomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState<Partial<Income> | null>(null);
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
      const [incomesData, categoriesData] = await Promise.all([getIncomes(), getCategories()]);
      setIncomes(Array.isArray(incomesData) ? incomesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else setGlobalError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomes = async () => {
    try {
      const data = await getIncomes();
      setIncomes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else setGlobalError('Erreur lors du rechargement des revenus.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
      try {
        await deleteIncome(id);
        setSuccessMessage('Revenu supprimé avec succès.');
        fetchIncomes();
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
      if (currentIncome && currentIncome._id) {
        await updateIncome(currentIncome._id, { amount, description, category });
        setSuccessMessage('Revenu mis à jour avec succès.');
      } else {
        await createIncome({ amount, description, category, date: new Date() });
        setSuccessMessage('Revenu créé avec succès.');
      }
      setIsFormOpen(false);
      setCurrentIncome(null);
      fetchIncomes();
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else setGlobalError('Impossible d\'enregistrer le revenu. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Revenus" 
        description="Gérez vos revenus" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentIncome(null); setFormErrors({}); setIsFormOpen(true); }}>+ Créer</button>} 
      />
      
      {successMessage && <FormFeedback message={successMessage} type="success" />}
      {globalError && <FormFeedback message={globalError} type="error" />}

      <div className="md:hidden space-y-4">
        {incomes.map((i) => (
          <div key={i._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-bold">{i.description}</p>
              <p className="text-sm text-gray-500">{categories.find(c => c._id === i.category)?.name || i.category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">{formatMGA(i.amount)}</p>
              <div className="flex gap-2 mt-2">
                <button className="text-blue-600 text-sm" onClick={() => { setCurrentIncome(i); setIsFormOpen(true); }}>Modif</button>
                <button className="text-red-600 text-sm" onClick={() => handleDelete(i._id)}>Suppr</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <DataTable data={incomes} columns={[
            { header: 'Description', accessor: (i: Income) => i.description },
            { header: 'Catégorie', accessor: (i: Income) => categories.find(c => c._id === i.category)?.name || i.category },
            { header: 'Montant', accessor: (i: Income) => formatMGA(i.amount) },
            { header: 'Actions', accessor: (i: Income) => (
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => { setCurrentIncome(i); setIsFormOpen(true); }}>Modifier</button>
                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(i._id)}>Supprimer</button>
              </div>
            )},
        ]} />
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSave}>
            <h2 className="text-lg font-bold mb-4">{currentIncome ? 'Modifier' : 'Créer'} un revenu</h2>
            
            <input name="description" defaultValue={currentIncome?.description} placeholder="Description" className={`border p-2 mb-1 w-full rounded ${formErrors.description ? 'border-red-500' : ''}`} />
            {formErrors.description && <p className="text-red-500 text-xs mb-2">{formErrors.description}</p>}
            
            <select name="category" defaultValue={currentIncome?.category || categories.filter(c => c.type === 'income')[0]?._id} className={`border p-2 mb-1 w-full rounded ${formErrors.category ? 'border-red-500' : ''}`}>
              {categories.filter(c => c.type === 'income').map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {formErrors.category && <p className="text-red-500 text-xs mb-2">{formErrors.category}</p>}
            
            <div className="relative mb-1">
              <input name="amount" type="number" defaultValue={currentIncome?.amount} placeholder="Montant" className={`border p-2 w-full rounded pr-12 ${formErrors.amount ? 'border-red-500' : ''}`} />
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
