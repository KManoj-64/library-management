import { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, CheckCircle, AlertCircle,
  TrendingUp
} from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeBorrows: 0,
    totalBorrowed: 0,
    overdue: 0,
    history: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions/my-history');
      const transactions = res.data;
      
      const active = transactions.filter(t => t.status === 'borrowed');
      const overdue = active.filter(t => new Date(t.dueDate) < new Date());
      
      setStats({
        activeBorrows: active.length,
        totalBorrowed: transactions.length,
        overdue: overdue.length,
        history: transactions.slice(0, 5) // Recent 5
      });
    } catch (error) {
      console.error('Failed to fetch student stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Active Borrows',
      value: stats.activeBorrows,
      icon: BookOpen,
      trend: 'Currently reading',
      color: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/30'
    },
    {
      title: 'Total Borrowed',
      value: stats.totalBorrowed,
      icon: CheckCircle,
      trend: 'All time',
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/30'
    },
    {
      title: 'Overdue Books',
      value: stats.overdue,
      icon: AlertCircle,
      trend: 'Needs attention',
      color: 'from-rose-400 to-red-500',
      shadow: 'shadow-rose-500/30'
    }
  ];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back! Here's your reading overview.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-200"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="relative z-10 mt-4 flex items-center text-sm text-gray-500">
                <TrendingUp className="mr-1 h-4 w-4 text-indigo-500" />
                <span className="font-medium text-indigo-600">{stat.trend}</span>
              </div>
              <div className={`absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.03] transition-transform group-hover:scale-150`}></div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {stats.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-6">
                {stats.history.map((t, idx) => (
                  <div key={t._id} className="flex relative">
                    {idx !== stats.history.length - 1 && (
                      <div className="absolute top-8 left-4 bottom-[-24px] w-px bg-gray-200" />
                    )}
                    <div className="relative mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-white">
                      {t.status === 'borrowed' ? <BookOpen className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t.status === 'borrowed' ? 'Borrowed' : 'Returned'} <span className="font-semibold">{t.book?.title || 'Unknown Book'}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(t.borrowDate || t.returnDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
