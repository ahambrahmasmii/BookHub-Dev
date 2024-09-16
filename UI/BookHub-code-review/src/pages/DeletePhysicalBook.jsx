import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import AddBook from '../components/AddBook';
import { fetchBooks as fetchBooksFromService, deleteBook as deleteBookFromService } from '../services/DeletePhysicalBookService';

const DeletePhysicalBook = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBooks = useCallback(async () => {
    try {
        const response = await fetchBooksFromService();
        setBooks(response.data);
    } catch (error) {
        toast.error("Failed to fetch books!");
    }
}, []);


  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async (book_name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the book "${book_name}"?`);
    if (confirmDelete) {
      try {
        const response = await deleteBookFromService(book_name);
        if (response.data.statusCode === 200) {
          setBooks(books.filter(book => book.book_name !== book_name));
          toast.success(response.data.message);
        } else if (response.data.statusCode === 404) {
          toast.error("Book not found");
        } else if (response.data.statusCode === 400) {
          toast.error("Cannot delete a borrowed book");
        } else {
          toast.error(response.data.message || "An error occurred while deleting the book");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || `Failed to delete book "${book_name}"`);
      }
    }
  };


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Removed searchBooks function call as it's not defined
    }
  };

  const filteredBooks = books.filter(book =>
    book.book_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
            Manage Physical Books
          </h3>
          <AddBook onBookAdded={fetchBooks}/>
        </div>
        
        <div className="mt-4 mb-6">
          <input
            type="text"
            placeholder="Search by book name or author"
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
          <table className="w-full table-auto text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-6">Sl.no</th>
                <th className="py-3 px-6">Book Name</th>
                <th className="py-3 px-6">Author</th>
                <th className="py-3 px-6">Delete</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {filteredBooks.map((book, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.book_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="px-4 py-2 text-red-600 bg-red-50 rounded-lg duration-150 hover:bg-red-100 active:bg-red-200"
                      onClick={() => handleDelete(book.book_name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DeletePhysicalBook;