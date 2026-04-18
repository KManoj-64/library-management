import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, CheckCircle, RefreshCw, X, FileText, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userId: '', bookId: '' });
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [transRes, usersRes, booksRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/users'),
        api.get('/books')
      ]);
      setTransactions(transRes.data);
      setUsers(usersRes.data.filter(u => u.role === 'student'));
      setBooks(booksRes.data.filter(b => b.availableCopies > 0));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filters = useMemo(() => {
    const issued = searchParams.get('issued');
    const status = searchParams.get('status');
    return {
      issuedToday: issued === 'today',
      status: status === 'issued' || status === 'returned' || status === 'overdue' ? status : null
    };
  }, [searchParams]);

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return transactions.filter((t) => {
      if (filters.status && t.status !== filters.status) {
        return false;
      }
      if (filters.issuedToday) {
        const issueDate = new Date(t.issueDate);
        if (issueDate < startOfToday || issueDate >= endOfToday) {
          return false;
        }
      }
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const bookMatch = t.bookId?.title?.toLowerCase().includes(searchLower) || false;
        const userMatch = t.userId?.name?.toLowerCase().includes(searchLower) || t.userId?.email?.toLowerCase().includes(searchLower) || false;
        if (!bookMatch && !userMatch) return false;
      }
      return true;
    });
  }, [transactions, filters, searchTerm]);

  const filterLabelParts = [];
  if (filters.issuedToday) {
    filterLabelParts.push('Issued today');
  }
  if (filters.status) {
    filterLabelParts.push(`Status: ${filters.status}`);
  }
  const filterLabel = filterLabelParts.join(' | ');

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions/issue', formData);
      toast.success('Book issued successfully');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Issue failed');
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.put(`/transactions/return/${id}`);
      toast.success('Book returned successfully');
      fetchData();
    } catch (error) {
      toast.error('Return failed');
    }
  };

  const handleRenew = async (id) => {
    try {
      await api.put(`/transactions/renew/${id}`);
      toast.success('Book renewed for another 14 days!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Renewal failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="mt-2 text-sm text-gray-500">Manage book rentals and returns.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-indigo-700 hover:shadow transition-all flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          <Plus size={20} className="mr-2" strokeWidth={2.5} /> Issue Book
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student or book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          />
        </div>

        {filterLabel && (
          <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-2 text-sm text-indigo-700 shadow-sm shrink-0">
            <span className="font-medium">Filtered: {filterLabel}</span>
            <Link
              to="/admin/transactions"
              className="inline-flex items-center justify-center rounded-full p-1 text-indigo-400 transition hover:bg-indigo-200 hover:text-indigo-800"
              aria-label="Clear filter"
              title="Clear filter"
            >
              <X size={14} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-gray-500 max-w-sm mx-auto">
              {searchTerm || filters.status ? "Try adjusting your filters or search term to find what you're looking for." : "There are currently no transaction records in the system."}
            </p>
          </div>
        ) : (
          filteredTransactions.map((t) => (
            <div
              key={t._id}
              className="group rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {t.bookId?.title || 'Unknown Book'}
                  </h2>
                  <p className="text-sm font-medium text-indigo-600 mt-1">
                    Student: <span className="text-gray-600">{t.userId?.name || 'Unknown Student'}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                      t.status === 'returned'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : t.status === 'overdue'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {t.status}
                  </span>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm flex items-center gap-2">    
                    <span className="text-xs uppercase font-medium text-gray-500">Fine:</span>
                    <span className="font-bold text-gray-900">₹{t.fine || 0}</span>
                  </div>
                  {t.status !== 'returned' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleReturn(t._id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 focus:ring-2 focus:ring-emerald-500"
                      >
                        <CheckCircle size={16} /> Return
                      </button>
                      <button
                        onClick={() => handleRenew(t._id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 focus:ring-2 focus:ring-blue-500"
                      >
                        <RefreshCw size={16} /> Renew
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3 pt-5 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Issue Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(t.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Due Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Contact</span>
                  <span className="font-medium text-gray-800 truncate" title={t.userId?.email}>
                    {t.userId?.email || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl animate-fade-up">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Issue New Book</h2>
            <form onSubmit={handleIssue}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student</label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                >
                  <option value="" disabled>Choose a student</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Book</label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  value={formData.bookId}
                  onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                  required
                >
                  <option value="" disabled>Choose a book</option>
                  {books.map(b => (
                    <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} strokeWidth={2.5} /> Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
