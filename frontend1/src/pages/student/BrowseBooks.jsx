import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, BookOpen, Layers, Hash, CheckCircle2, XCircle } from 'lucide-react';

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/books');
        setBooks(res.data);
      } catch (error) {
        console.error('Failed to fetch books', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.ISBN.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Library</h1>
        <p className="mt-2 text-sm text-gray-500">Explore the complete catalog and check real-time availability.</p>
      </div>

      <div className="mb-8 relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by title, author, category or ISBN..."
          className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 transition-all placeholder-gray-400 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-white">
          <div className="bg-gray-50 p-5 rounded-full mb-5">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">No books found</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
            {searchTerm ? "We couldn't find any books matching your search. Try different keywords." : "The library catalog is currently empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <div 
              key={book._id} 
              className="group relative flex flex-col bg-white rounded-3xl border border-gray-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-100 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${book.availableCopies > 0 ? 'from-emerald-50' : 'from-rose-50'} to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100 -z-10`}></div>

              <div className="flex items-start gap-4 mb-5">
                <div className="flex shrink-0 h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50">
                  <BookOpen strokeWidth={2} className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight line-clamp-2 leading-tight">
                    {book.title}
                  </h2>
                  <p className="font-medium text-gray-500 mt-1">by <span className="text-gray-700">{book.author}</span></p>
                </div>
              </div>

              <div className="mt-auto space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg text-xs tracking-wider uppercase">{book.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span>{book.ISBN}</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                  book.availableCopies > 0 
                    ? 'bg-emerald-50/50 border-emerald-100' 
                    : 'bg-rose-50/50 border-rose-100'
                }`}>
                  <span className={`text-sm font-bold flex items-center gap-2 ${
                    book.availableCopies > 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {book.availableCopies > 0 
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 
                      : <XCircle className="w-5 h-5 text-rose-500" />
                    }
                    {book.availableCopies > 0 ? 'Available Now' : 'Out of Stock'}
                  </span>
                  
                  {book.availableCopies > 0 && (
                    <span className="bg-white text-emerald-700 shadow-sm px-3 py-1 rounded-xl text-sm font-black border border-emerald-100">
                      {book.availableCopies} left
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseBooks;
