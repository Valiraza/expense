import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, TrendingUp, PieChart, Landmark, Settings, User, LogOut } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">ExpenseTracker</h1>
        <nav className="flex-1 space-y-2">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/expenses" icon={Receipt} label="Dépenses" />
          <SidebarItem to="/incomes" icon={TrendingUp} label="Revenus" />
          <SidebarItem to="/budgets" icon={Landmark} label="Budgets" />
          <SidebarItem to="/categories" icon={PieChart} label="Catégories" />
        </nav>
        <div className="border-t border-gray-800 pt-6 space-y-2">
          <SidebarItem to="/profile" icon={User} label="Profil" />
          <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
