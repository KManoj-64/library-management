import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, Users as UsersIcon, Search, ShieldCheck, Mail, Calendar, Key, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const verifiedFilter = searchParams.get('verified');
  const roleFilter = searchParams.get('role');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter by verification status
      if (verifiedFilter !== null) {
        const isVerifiedStr = String(user.isVerified);
        if (isVerifiedStr !== verifiedFilter) return false;
      }
      
      // Filter by role
      if (roleFilter && user.role !== roleFilter) return false;
      
      // Filter by search term
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        return (
          user.name?.toLowerCase().includes(lower) ||
          user.email?.toLowerCase().includes(lower) ||
          user.collegeId?.toLowerCase().includes(lower)
        );
      }
      
      return true;
    });
  }, [users, verifiedFilter, roleFilter, searchTerm]);

  const activeFilters = [];
  if (verifiedFilter !== null) activeFilters.push(verifiedFilter === 'true' ? 'Verified' : 'Unverified');
  if (roleFilter) activeFilters.push(roleFilter === 'admin' ? 'Admins' : 'Students');

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="mt-2 text-sm text-gray-500">View and manage all registered students and administrators.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          />
        </div>

        {activeFilters.length > 0 && (
          <div className="inline-flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-2 text-sm text-indigo-700 shadow-sm shrink-0">
            <span className="font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Filtered: {activeFilters.join(' • ')}</span>
            <Link
              to="/admin/users"
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
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <UsersIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-gray-500 max-w-sm mx-auto">
              {searchTerm || activeFilters.length > 0 ? "No users matched your search criteria." : "There are no users registered in the system yet."}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="group rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:border-indigo-200 hover:scale-[1.01] relative overflow-hidden"
            >
              {/* Decorative side accent for roles */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${user.role === 'admin' ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-gray-200 transition-colors'}`}></div>
              
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pl-2">
                <div className="flex items-center gap-4">
                  {/* Avatar Bubble */}
                  <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg shadow-sm border-2 ${
                    user.role === 'admin' 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                      : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      {user.name}
                      {user.role === 'admin' && (
                        <ShieldCheck className="w-4 h-4 text-indigo-500" title="Administrator" />
                      )}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      user.isVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    {user.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-4 pl-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-medium tracking-wider text-gray-400">College ID</p>
                    <p className="text-sm font-semibold text-gray-900">{user.collegeId || 'Not Provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-medium tracking-wider text-gray-400">Joined Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
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

export default Users;
