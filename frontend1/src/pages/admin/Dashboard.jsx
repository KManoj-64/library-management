import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Book, Users, AlertCircle, TrendingUp, Activity, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/transactions/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const data = stats?.monthlyActivity?.map((m) => ({
    name: m.label,
    borrowed: m.borrowed,
    returned: m.returned
  })) || [];

  const statCards = [
    {
      label: 'Total Books',
      value: stats?.totalBooks || 0,
      to: '/admin/books',
      icon: Book,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30'
    },
    {
      label: 'Issued Today',
      value: stats?.booksIssuedToday || 0,
      to: '/admin/transactions?issued=today',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
    },
    {
      label: 'Overdue Books',
      value: stats?.overdueBooks || 0,
      to: '/admin/transactions?status=overdue',
      icon: AlertCircle,
      color: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30'
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers || 0,
      to: '/admin/users?verified=true&role=student',
      icon: UserCheck,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-blue-500/30'
    }
  ];

  return (
    <div className="animate-fade-up max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
        <p className="mt-2 text-sm text-gray-500 font-medium">Monitor your library statistics and recent activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className="group flex flex-col bg-white rounded-2xl p-6 border border-gray-200 shadow-md transition-all duration-200 hover:shadow-xl hover:border-indigo-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 bg-gray-50 rounded-bl-full opacity-50 group-hover:bg-indigo-50/50 transition-colors -z-10"></div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3.5 rounded-xl shadow-lg ${card.color}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{card.value}</h3>
                <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wide">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Borrowing Trends</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Monthly borrowed vs returned books</p>
          </div>
          <div className="bg-gray-100 p-2.5 rounded-xl">
            <Activity className="text-indigo-500 w-5 h-5" />
          </div>
        </div>

        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
              />
              <Tooltip 
                cursor={{ fill: '#F3F4F6', opacity: 0.4 }}
                contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 500 }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 500 }} />
              <Bar dataKey="borrowed" name="Borrowed" fill="url(#colorBorrowed)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="returned" name="Returned" fill="url(#colorReturned)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <defs>
                <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
