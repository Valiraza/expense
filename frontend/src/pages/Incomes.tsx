import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import { getIncomes, createIncome, updateIncome, deleteIncome, Income } from '../services/incomeService';
import { getCategories, Category } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';
import { formatMGA } from '../utils/formatCurrency';

export default function Incomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState<Partial<Income> | null>(null);
  const [loading, setLoading] = useState(true);
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
      else alert('Erreur lors du chargement des données');
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
      else alert('Erreur lors du chargement des revenus');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
      try {
        await deleteIncome(id);
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
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const description = (form.elements.namedItem('description') as HTMLInputElement).value;
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value;

    try {
      if (currentIncome && currentIncome._id) {
        await updateIncome(currentIncome._id, { amount, description, category });
      } else {
        await createIncome({ amount, description, category, date: new Date() });
      }
      setIsFormOpen(false);
      setCurrentIncome(null);
      fetchIncomes();
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else alert('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) return <div>Chargement...</div>;

  const columns = [
    { header: 'Description', accessor: (i: Income) => i.description },
    { header: 'Catégorie', accessor: (i: Income) => categories.find(c => c._id === i.category)?.name || i.category },
    { header: 'Montant', accessor: (i: Income) => formatMGA(i.amount) },
    { header: 'Actions', accessor: (i: Income) => (
      <div className="flex gap-2">
        <button className="text-blue-600 hover:text-blue-800" onClick={() => { setCurrentIncome(i); setIsFormOpen(true); }}>Modifier</button>
        <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(i._id)}>Supprimer</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Revenus" 
        description="Gérez vos revenus" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentIncome(null); setIsFormOpen(true); }}>+ Créer</button>} 
      />
      
      {/* Mobile View */}
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

      {/* Desktop View */}
      <div className="hidden md:block">
        <DataTable data={incomes} columns={columns} />
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSave}>
            <h2 className="text-lg font-bold mb-4">{currentIncome ? 'Modifier' : 'Créer'} un revenu</h2>
            <input name="description" defaultValue={currentIncome?.description} placeholder="Description" className="border p-2 mb-2 w-full rounded" required />
            <select name="category" defaultValue={currentIncome?.category || categories.filter(c => c.type === 'income')[0]?._id} className="border p-2 mb-2 w-full rounded" required>
              {categories.filter(c => c.type === 'income').map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <div className="relative mb-4">
              <input name="amount" type="number" defaultValue={currentIncome?.amount} placeholder="Montant" className="border p-2 w-full rounded pr-12" required />
              <span className="absolute right-3 top-2.5 text-gray-500">Ar</span>
            </div>
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
