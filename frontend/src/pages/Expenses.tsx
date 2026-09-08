import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import { getExpenses, createExpense, updateExpense, deleteExpense, Expense } from '../services/expenseService';
import { getCategories, Category } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';
import { formatMGA } from '../utils/formatCurrency';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense> | null>(null);
  const [loading, setLoading] = useState(true);
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
      else alert('Erreur lors du chargement des données');
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
      else alert('Erreur lors du chargement des dépenses');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        await deleteExpense(id);
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
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const description = (form.elements.namedItem('description') as HTMLInputElement).value;
    const category = (form.elements.namedItem('category') as HTMLInputElement).value;

    try {
      if (currentExpense && currentExpense._id) {
        await updateExpense(currentExpense._id, { amount, description, category });
      } else {
        await createExpense({ amount, description, category, date: new Date() });
      }
      setIsFormOpen(false);
      setCurrentExpense(null);
      fetchExpenses();
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else alert('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) return <div>Chargement...</div>;

  const columns = [
    { header: 'Description', accessor: (e: Expense) => e.description },
    { header: 'Catégorie', accessor: (e: Expense) => categories.find(c => c._id === e.category)?.name || e.category },
    { header: 'Montant', accessor: (e: Expense) => formatMGA(e.amount) },
    { header: 'Actions', accessor: (e: Expense) => (
      <div className="flex gap-2">
        <button className="text-blue-600 hover:text-blue-800" onClick={() => { setCurrentExpense(e); setIsFormOpen(true); }}>Modifier</button>
        <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(e._id)}>Supprimer</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dépenses" 
        description="Gérez vos dépenses" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentExpense(null); setIsFormOpen(true); }}>+ Créer</button>} 
      />
      
      {/* Mobile View */}
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

      {/* Desktop View */}
      <div className="hidden md:block">
        <DataTable data={expenses} columns={columns} />
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSave}>
            <h2 className="text-lg font-bold mb-4">{currentExpense ? 'Modifier' : 'Créer'} une dépense</h2>
            <input name="description" defaultValue={currentExpense?.description} placeholder="Description" className="border p-2 mb-2 w-full rounded" required />
            <select name="category" defaultValue={currentExpense?.category || categories.filter(c => c.type === 'expense')[0]?._id} className="border p-2 mb-2 w-full rounded" required>
              {categories.filter(c => c.type === 'expense').map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <div className="relative mb-4">
              <input name="amount" type="number" defaultValue={currentExpense?.amount} placeholder="Montant" className="border p-2 w-full rounded pr-12" required />
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
