import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Book, History, LogOut, Menu, X, LibraryBig } from 'lucide-react';

const StudentLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-950 shrink-0">  
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-md">
              <LibraryBig className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">StudentPortal</span>
          </Link>
          <button 
            className="md:hidden ml-auto text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto px-3 space-y-1">
          <div className="px-3 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Main Menu</div>
          
          <NavLink
            to="/student"
            end
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/student/browse"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Book className="w-5 h-5 mr-3" />
            <span className="font-medium">Browse Books</span>
          </NavLink>
          
          <NavLink
            to="/student/history"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <History className="w-5 h-5 mr-3" />
            <span className="font-medium">My Loans</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-950 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-400" />
            <span className="font-medium text-red-100">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-10 shadow-sm">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-gray-600 hover:text-indigo-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
              Hello, {user?.name?.split(' ')[0]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-900">{user?.name}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full mt-1">Student</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
