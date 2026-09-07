import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import { getIncomes, createIncome, updateIncome, deleteIncome, Income } from '../services/incomeService';
import { getCategories, Category } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';

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
    { header: 'Montant', accessor: (i: Income) => `${i.amount} €` },
    { header: 'Actions', accessor: (i: Income) => (
      <div className="flex gap-2">
        <button className="text-blue-600" onClick={() => { setCurrentIncome(i); setIsFormOpen(true); }}>Modifier</button>
        <button className="text-red-600" onClick={() => handleDelete(i._id)}>Supprimer</button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader 
        title="Revenus" 
        description="Gérez vos revenus" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentIncome(null); setIsFormOpen(true); }}>+ Créer un revenu</button>} 
      />
      <DataTable data={incomes} columns={columns} />

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form className="bg-white p-6 rounded-lg shadow-lg" onSubmit={handleSave}>
            <h2 className="text-lg font-bold mb-4">{currentIncome ? 'Modifier' : 'Créer'} un revenu</h2>
            <input name="description" defaultValue={currentIncome?.description} placeholder="Description" className="border p-2 mb-2 w-full" required />
            <select name="category" defaultValue={currentIncome?.category || categories.filter(c => c.type === 'income')[0]?._id} className="border p-2 mb-2 w-full" required>
              {categories.filter(c => c.type === 'income').map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input name="amount" type="number" defaultValue={currentIncome?.amount} placeholder="Montant" className="border p-2 mb-4 w-full" required />
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
