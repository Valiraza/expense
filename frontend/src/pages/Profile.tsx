import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import api from '../services/api';

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me').then(res => setUser(res.data)).catch(console.error);
  }, []);

  if (!user) return <div>Chargement...</div>;

  return (
    <div>
      <PageHeader title="Profil" description="Gérez vos informations personnelles" />
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl">👤</div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
