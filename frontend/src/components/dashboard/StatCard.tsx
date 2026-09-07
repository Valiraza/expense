export interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: string;
  color: string;
}

export const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
      {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
    </div>
    {icon && <div className="text-gray-400">{icon}</div>}
  </div>
);
