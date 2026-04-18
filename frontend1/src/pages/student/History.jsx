import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, Search, Clock, Calendar, CheckCircle, AlertOctagon, BookOpen, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const History = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

  const fetchHistory = async () => {
    try {
      const res = await api.get('/transactions/my');
      setLoans(res.data);
    } catch (error) {
      toast.error('Failed to fetch borrowing history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const statusFilter = useMemo(() => {
    const status = searchParams.get('status');
    if (status === 'overdue' || status === 'returned' || status === 'issued' || status === 'active') {
      return status;
    }
    return null;
  }, [searchParams]);

  const filteredLoans = useMemo(() => {
    let result = loans;
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter((loan) => {
        if (statusFilter === 'active') {
          return loan.status !== 'returned';
        }
        return loan.status === statusFilter;
      });
    }
    
    // Apply text search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(loan => 
        loan.bookId?.title?.toLowerCase().includes(lower) ||
        loan.bookId?.author?.toLowerCase().includes(lower)
      );
    }
    
    return result;
  }, [loans, statusFilter, searchTerm]);

  const filterLabel = useMemo(() => {
    if (!statusFilter) return '';
    if (statusFilter === 'active') return 'Active Loans Only';
    return `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`;
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5" /> Returned
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
            <AlertOctagon className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      case 'issued':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Clock className="w-3.5 h-3.5" /> Issued
          </span>
        );
    }
  };


  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Borrowing History</h1>
        <p className="mt-2 text-sm text-gray-500">Track your past and current book loans, due dates, and return status.</p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by book title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none shadow-sm"
          />
        </div>

        {filterLabel && (
          <div className="inline-flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-2 text-sm text-indigo-700 shadow-sm shrink-0">
            <span className="font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {filterLabel}</span>
            <Link
              to="/student/history"
              className="inline-flex items-center justify-center rounded-full p-1 text-indigo-400 transition hover:bg-indigo-200 hover:text-indigo-800"
              aria-label="Clear filter"
              title="Clear filters"
            >
              <X size={14} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">No history found</h3>
            <p className="mt-1 text-gray-500 max-w-sm mx-auto">
              {searchTerm || filterLabel ? "No records match your filters." : "You haven't borrowed any books yet."}
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div
              key={loan._id}
              className="group rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:border-indigo-200 hover:scale-[1.01] relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                loan.status === 'returned' ? 'bg-emerald-400' :
                loan.status === 'overdue' ? 'bg-rose-500' : 'bg-indigo-400'
              }`}></div>
              
              <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between pl-2">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 border border-gray-100">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-snug mb-1">
                      {loan.bookId?.title || 'Unknown Book'}
                    </h2>
                    {loan.bookId?.author && (
                      <p className="text-sm font-medium text-gray-500">by {loan.bookId.author}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 bg-gray-50 p-4 rounded-xl border border-gray-100/50 shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Issued:</span>
                      <span className="font-semibold text-gray-900">{new Date(loan.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 underline decoration-gray-300 decoration-dotted underline-offset-4">Due:</span>
                      <span className={`font-bold ${loan.status === 'overdue' ? 'text-rose-600' : 'text-gray-900'}`}>
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
                  
                  <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    {getStatusBadge(loan.status)}
                    {loan.returnDate && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        Returned on {new Date(loan.returnDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
