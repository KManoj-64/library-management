import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Search, BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '', author: '', ISBN: '', category: '', totalCopies: '', availableCopies: ''
  });
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const stockFilter = searchParams.get('stock');
  const isOutOfStock = stockFilter === 'out';

  const filteredBooks = useMemo(() => {
    let result = books;
    if (isOutOfStock) {
      result = result.filter((book) => Number(book.availableCopies) <= 0);
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.ISBN.toLowerCase().includes(searchLower)
      );
    }
    return result;
  }, [books, isOutOfStock, searchTerm]);

  const handleOpenModal = (book = null) => {
    if (book) {
      setCurrentBook(book);
      setFormData(book);
    } else {
      setCurrentBook(null);
      setFormData({
        title: '', author: '', ISBN: '', category: '', totalCopies: '', availableCopies: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentBook) {
        await api.put(`/books/${currentBook._id}`, formData);
        toast.success('Book updated successfully');
      } else {
        await api.post('/books', formData);
        toast.success('Book added successfully');
      }
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you certain you want to delete this book? This action cannot be undone.')) {
      try {
        await api.delete(`/books/${id}`);
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Books Library</h1>
          <p className="mt-2 text-sm text-gray-500">Manage your book catalog, add new arrivals, and edit details.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-indigo-700 hover:shadow transition-all flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          <Plus size={20} className="mr-2" strokeWidth={2.5} /> Add Book
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          />
        </div>

        {isOutOfStock && (
          <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-2 text-sm text-rose-700 shadow-sm shrink-0">
            <span className="font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Filtered: Out of Stock</span>
            <Link
              to="/admin/books"
              className="inline-flex items-center justify-center rounded-full p-1 text-rose-400 transition hover:bg-rose-200 hover:text-rose-800"
              aria-label="Clear filter"
              title="Clear filter"
            >
              <X size={14} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-gray-500 max-w-sm mx-auto">
              {searchTerm || isOutOfStock ? "No books matched your filters. Try clearing them to see all books." : "The library catalog is currently empty. Click 'Add Book' to get started."}
            </p>
          </div>
        ) : (
          filteredBooks.map((b) => (
            <div
              key={b._id}
              className="group rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:border-indigo-200 hover:scale-[1.01]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
                    {b.title}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <span className="text-gray-900">{b.author}</span> •
                    <span>ISBN: {b.ISBN}</span> •
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider">{b.category}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 shrink-0 mt-2 lg:mt-0">
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <div className="flex flex-col items-center">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Total</span>
                      <span className="font-bold text-gray-900">{b.totalCopies}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200 mx-1"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Available</span>
                      <span className={`font-bold ${b.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {b.availableCopies}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(b)}
                      className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-1"
                      aria-label="Edit book"
                      title="Edit"
                    >
                      <Edit size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 rounded-xl transition-colors focus:ring-2 focus:ring-rose-500 focus:outline-none focus:ring-offset-1"
                      aria-label="Delete book"
                      title="Delete"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">
              {currentBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Book Title</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                    placeholder="e.g. The Great Gatsby"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                    placeholder="e.g. F. Scott Fitzgerald"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                      placeholder="e.g. 978-3-16-148410-0"
                      value={formData.ISBN}
                      onChange={(e) => setFormData({ ...formData, ISBN: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                      placeholder="e.g. Fiction"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Copies</label>
                    <input
                      type="number"
                      className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                      min="1"
                      value={formData.totalCopies}
                      onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Available Copies</label>
                    <input
                      type="number"
                      className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                      min="0"
                      max={formData.totalCopies}
                      value={formData.availableCopies}
                      onChange={(e) => setFormData({ ...formData, availableCopies: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                >
                  {currentBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
