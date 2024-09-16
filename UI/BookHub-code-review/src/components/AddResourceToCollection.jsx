import React, { useState, useCallback } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import { toast, Toaster } from 'react-hot-toast';
import { addResource } from '../services/AddResourceToCollectionService';


const AddResourceToCollection = ({ collections, updateCollections }) => {
    const [formData, setFormData] = useState({
        resourceName: "",
        link: "",
        description: "",
        collectionName: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const response = await addResource(formData);

    
            toast.success(response.data.message || "Resource added successfully");
            setFormData({
                resourceName: "",
                link: "",
                description: "",
                collectionName: "",
            });
          await updateCollections();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to add resource");
        } finally {
          setIsLoading(false);
        }
    }, [formData, updateCollections]);

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
            <Dialog.Root className="fixed inset-0 z-10 overflow-y-auto">
                <Dialog.Trigger className="px-3 py-1.5 text-base text-white duration-150 bg-indigo-600 rounded-full hover:bg-indigo-500 active:bg-indigo-700 mx-3">
                    Add Resource
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 w-full h-full bg-black opacity-40" />
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
                                    Add Resource to Collection
                                </Dialog.Title>
                                <Dialog.Description className="mt-1 text-sm leading-relaxed text-center text-gray-500">
                                    
                                </Dialog.Description>
                                <form onSubmit={handleSubmit}>
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            name="resourceName"
                                            placeholder="Enter Resource Title"
                                            value={formData.resourceName}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isLoading}
                                            className="w-full mb-4 pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                        />
                                    </div>
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            name="link"
                                            placeholder="Enter Resource Link"
                                            value={formData.link}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isLoading}
                                            className="w-full mb-4 pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                        />
                                    </div>
                                    <div className="relative mb-3">
                                        <textarea
                                            name="description"
                                            placeholder="Enter Resource Description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isLoading}
                                            className="w-full mb-4 pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                            rows={3}
                                        ></textarea>
                                    </div>
                                    <div className="relative mb-3">
                                    <select
                                        name="collectionName"
                                        value={formData.collectionName}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isLoading}
                                        className="w-full mb-4 pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                                    >
                                        <option value="">Select Collection</option>
                                        {collections.map((collection, index) => (
                                            <option key={index} value={collection.collection_name}>
                                            {collection.collection_name}
                                            </option>
                                        ))}
                                    </select>
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
};

export default AddResourceToCollection;