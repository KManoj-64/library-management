import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Library } from 'lucide-react';

const navItems = [
  { label: 'Student Login', to: '/login' },
  { label: 'Register', to: '/register' },
  { label: 'Admin Login', to: '/login' }
];

const NavItem = ({ to, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    {label}
  </NavLink>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="group flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
            <Library className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">LMS Gateway</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={handleToggle}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {open ? (
        <div className="border-t border-gray-200/80 bg-white px-6 py-4 shadow-xl md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavItem key={item.label} {...item} onClick={handleClose} />
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
