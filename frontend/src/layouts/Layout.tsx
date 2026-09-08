import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, TrendingUp, PieChart, Landmark, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link to={to} onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export default function Layout() {
  const { logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 text-white w-full fixed top-0 z-50">
        <h1 className="text-xl font-bold">ExpenseTracker</h1>
        <button onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar / Mobile Drawer */}
      <aside className={`fixed md:static inset-0 z-40 w-64 bg-gray-900 text-white p-6 flex flex-col transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="md:hidden flex justify-end mb-4">
          <button onClick={toggleMobileMenu}>
            <X size={24} />
          </button>
        </div>
        <h1 className="text-xl font-bold mb-8 hidden md:block">ExpenseTracker</h1>
        <nav className="flex-1 space-y-2 mt-16 md:mt-0">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/expenses" icon={Receipt} label="Dépenses" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/incomes" icon={TrendingUp} label="Revenus" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/budgets" icon={Landmark} label="Budgets" onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarItem to="/categories" icon={PieChart} label="Catégories" onClick={() => setIsMobileMenuOpen(false)} />
        </nav>
        <div className="border-t border-gray-800 pt-6 space-y-2">
          <SidebarItem to="/profile" icon={User} label="Profil" onClick={() => setIsMobileMenuOpen(false)} />
          <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleMobileMenu} />
      )}

      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
