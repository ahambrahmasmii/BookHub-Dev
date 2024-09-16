import React, { useState, useCallback } from "react";
import { toast, Toaster } from 'react-hot-toast';
import * as Dialog from "@radix-ui/react-dialog";
import { createCollection } from '../services/CreateCollectionService';

const CreateCollection = ({ updateCollections }) => {
    const [collectionName, setCollectionName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = useCallback((e) => {
        setCollectionName(e.target.value);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const response = await createCollection(collectionName);
            toast.success(response.data.message || "Collection created successfully");
            setCollectionName("");
            await updateCollections();
        } catch (error) {
            console.error("Error submitting collection:", error);
            toast.error(error.response?.data?.message || "Failed to create collection");
        } finally {
            setIsLoading(false);
        }
    }, [collectionName, updateCollections]);

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
                    Create Collection
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
                                    Create a new Collection
                                </Dialog.Title>
                                <Dialog.Description className="mt-1 text-sm leading-relaxed text-center text-gray-500">
                                    Enter the name of the new collection below.
                                </Dialog.Description>
                                <form onSubmit={handleSubmit}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Enter Collection Name"
                                            required
                                            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                            onChange={handleInputChange}
                                            value={collectionName}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <button 
                                        className="w-full mt-3 py-3 px-4 font-medium text-sm text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg ring-offset-2 ring-indigo-600 focus:ring-2"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Submitting..." : "Submit"}
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

export default CreateCollection;
