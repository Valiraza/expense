import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Erreur lors du chargement des catégories');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (error: any) {
        if (error.response?.status === 401) navigate('/login');
        else alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const type = (form.elements.namedItem('type') as HTMLSelectElement).value as 'expense' | 'income';

    try {
      if (currentCategory && currentCategory._id) {
        await updateCategory(currentCategory._id, { name, type });
      } else {
        await createCategory({ name, type });
      }
      setIsFormOpen(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (error: any) {
      if (error.response?.status === 401) navigate('/login');
      else alert('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) return <div>Chargement...</div>;

  const columns = [
    { header: 'Nom', accessor: (c: Category) => c.name },
    { header: 'Type', accessor: (c: Category) => c.type },
    { header: 'Actions', accessor: (c: Category) => (
      <div className="flex gap-2">
        <button className="text-blue-600" onClick={() => { setCurrentCategory(c); setIsFormOpen(true); }}>Modifier</button>
        <button className="text-red-600" onClick={() => handleDelete(c._id)}>Supprimer</button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader 
        title="Catégories" 
        description="Gérez vos catégories" 
        action={<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={() => { setCurrentCategory(null); setIsFormOpen(true); }}>+ Créer une catégorie</button>} 
      />
      <DataTable data={categories} columns={columns} />

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form className="bg-white p-6 rounded-lg shadow-lg" onSubmit={handleSave}>
            <h2 className="text-lg font-bold mb-4">{currentCategory ? 'Modifier' : 'Créer'} une catégorie</h2>
            <input name="name" defaultValue={currentCategory?.name} placeholder="Nom" className="border p-2 mb-2 w-full" required />
            <select name="type" defaultValue={currentCategory?.type || 'expense'} className="border p-2 mb-4 w-full">
              <option value="expense">Dépense</option>
              <option value="income">Revenu</option>
            </select>
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
