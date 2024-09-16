import React, { useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast, Toaster } from 'react-hot-toast';
import { addBook } from "../services/AddBookService";

const AddBook = ({onBookAdded}) => {
    const [bookData, setBookData] = useState({
        book_name: "",
        author: "",
        contributors: "",
        copies: 1,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = useCallback((e) => {
        const value = e.target.name === 'copies' ? parseInt(e.target.value) : e.target.value;
        setBookData(prevData => ({
            ...prevData,
            [e.target.name]: value
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const addBookPromise = addBook(bookData);

        toast.promise(
            addBookPromise,
            {
                loading: 'Adding book...',
                success: (response) => {
                    setBookData({
                        book_name: "",
                        author: "",
                        contributors: "",
                        copies: 1,
                    });
                    onBookAdded();
                    return response.data.message || "Book added successfully";
                },
                error: (error) => error.response?.data?.message || "Failed to add book",
            }
        );

        try {
            await addBookPromise;
        } catch (error) {
            // Error handling already covered by toast.promise
        } finally {
            setIsLoading(false);
        }
    }, [bookData, onBookAdded]);

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
            <Dialog.Root>
                <Dialog.Trigger className="px-3 py-1.5 text-base text-white duration-150 bg-indigo-600 rounded-full hover:bg-indigo-500 active:bg-indigo-700 mx-3">
                    Add Book
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black opacity-40" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg mx-auto px-4">
                        <div className="bg-white rounded-md shadow-lg px-4 py-6">
                            <div className="flex items-center justify-end">
                                <Dialog.Close className="p-2 text-gray-400 rounded-md hover:bg-gray-100">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 mx-auto"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Dialog.Close>
                            </div>
                            <div className="max-w-sm mx-auto space-y-3 text-center">
                                <Dialog.Title className="text-lg font-medium text-gray-800">
                                    Add Book
                                </Dialog.Title>
                                <form onSubmit={handleSubmit}>
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            name="book_name"
                                            placeholder="Enter Book Name"
                                            required
                                            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg mb-4"
                                            onChange={handleChange}
                                            value={bookData.book_name}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            name="author"
                                            placeholder="Enter Author Name"
                                            required
                                            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg mb-4"
                                            onChange={handleChange}
                                            value={bookData.author}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            name="contributors"
                                            placeholder="Enter Contributors"
                                            required
                                            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg mb-4"
                                            onChange={handleChange}
                                            value={bookData.contributors}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="relative mb-3">
                                        <input
                                            type="number"
                                            name="copies"
                                            placeholder="Enter Number of Copies"
                                            required
                                            min="1"
                                            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                            onChange={handleChange}
                                            value={bookData.copies}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <button 
                                        className="w-full mt-3 py-3 px-4 font-medium text-sm text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg ring-offset-2 ring-indigo-600 focus:ring-2"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Adding..." : "Add Book"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}

export default AddBook;