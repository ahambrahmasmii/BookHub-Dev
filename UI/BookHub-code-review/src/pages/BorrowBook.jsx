import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { fetchBooks, borrowBook, returnBook } from '../services/BorrowBookService';

const BorrowBook = () => {
  const user = useSelector(state => state.user);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const loggedInUser = user.name;

  const fetchBooksData = useCallback(async () => {
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (error) {
      toast.error("Failed to fetch books!");
    }
  }, []);
  
  useEffect(() => {
    fetchBooksData();
  }, [fetchBooksData]);

  const handleBorrow = async (book_name) => {
    toast.promise(
      borrowBook(book_name),
      {
        loading: 'Borrowing book...',
        success: (data) => {
          if (data.statusCode === 200) {
            setBooks(
              books.map((book) =>
                book.book_name === book_name
                  ? { ...book, borrowby: loggedInUser, borrow_date: new Date().toISOString() }
                  : book
              )
            );
            return data.message;
          } else {
            throw new Error(data.message);
          }
        },
        error: (err) => {
          if (err.message === "Not authenticated") {
            return "You need to be logged in to borrow a book";
          } else if (err.message === "Book not found or already borrowed") {
            return "This book is not available for borrowing";
          } else {
            return err.message || "Failed to borrow book";
          }
        },
      }
    );
  };
  
  const handleReturn = async (book_name) => {
    toast.promise(
      returnBook(book_name),
      {
        loading: 'Returning book...',
        success: (data) => {
          if (data.statusCode === 200) {
            setBooks(
              books.map((book) =>
                book.book_name === book_name ? { ...book, borrowby: null, borrow_date: null } : book
              )
            );
            return data.message;
          } else {
            throw new Error(data.message);
          }
        },
        error: (err) => {
          if (err.message === "Not authenticated") {
            return "You need to be logged in to return a book";
          } else if (err.message === "You can only return books borrowed by you") {
            return "You can only return books that you have borrowed";
          } else if (err.message === "Book not found or already returned") {
            return "This book cannot be returned at the moment";
          } else {
            return err.message || "Failed to return book";
          }
        },
      }
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
          className: '',
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
            Borrow Book
          </h3>
        </div>
        
        <div className="mt-4 mb-6">
          <input
            type="text"
            placeholder="Search by book name or author"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
          <table className="w-full table-auto text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-6">Book Name</th>
                <th className="py-3 px-6">Author</th>
                <th className="py-3 px-6">Borrow Date</th>
                <th className="py-3 px-6"></th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {filteredBooks.map((book, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">{book.book_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {book.borrow_date ? new Date(book.borrow_date).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className={`px-4 py-2 text-indigo-600 rounded-lg duration-150 ${
                        book.borrowby 
                          ? 'bg-gray-100 cursor-not-allowed' 
                          : 'bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200'
                      }`}
                      onClick={() => handleBorrow(book.book_name)}
                      disabled={!!book.borrowby}
                    >
                      {book.borrowby ? `Borrowed by ${book.borrowby}` : "Borrow Book"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className={`px-4 py-2 text-indigo-600 rounded-lg duration-150 ${
                        book.borrowby === loggedInUser
                          ? 'bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200'
                          : 'bg-gray-100 cursor-not-allowed'
                      }`}
                      onClick={() => handleReturn(book.book_name)}
                      disabled={book.borrowby !== loggedInUser}
                    >
                      Return Book
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

export default BorrowBook;