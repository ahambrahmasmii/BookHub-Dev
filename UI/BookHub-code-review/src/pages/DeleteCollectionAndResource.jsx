import React, { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from 'react-hot-toast';
import { fetchCollections, deleteCollection, fetchResources, deleteResource } from '../services/DeleteCollectionService';
import CreateCollection from "../components/CreateCollection";
import AddResourceToCollection from "../components/AddResourceToCollection";

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 mr-3 text-gray-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM20 12a8 8 0 01-8 8v4c3.627 0 8-4.373 8-8h-4zm-2-5.291A8.004 8.004 0 0120 12h4c0-3.042-1.135-5.824-3-7.938l-3 2.647z"
    ></path>
  </svg>
);

const DeleteCollectionAndResource = () => {
  const [collections, setCollections] = useState([]);
  const [openCollections, setOpenCollections] = useState({});
  const [openResources, setOpenResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingResources, setLoadingResources] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const updateCollections = useCallback(async () => {
    try {
      console.log("Fetching collections...");
      const response = await fetchCollections();
      console.log("Collections response:", response.data);
      if (Array.isArray(response.data) && response.data.length > 0 && Array.isArray(response.data[0])) {
        setCollections(response.data[0]);
        console.log("Collections set:", response.data[0]);
      } else {
        console.error("Unexpected response format for collections:", response.data);
      }
    } catch (error) {
      console.error("Error updating collections:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      toast.error("Failed to fetch collections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateCollections();
  }, [updateCollections]);

  const fetchResourcesData = useCallback(async (collectionName) => {
    try {
      console.log(`Fetching resources for ${collectionName}`);
      const response = await fetchResources(collectionName);
      console.log(`Resources for ${collectionName}:`, response.data);
      if (Array.isArray(response.data) && response.data.length > 0 && Array.isArray(response.data[0])) {
        return response.data[0].filter((resource) => resource.resource_name && resource.resource_name.trim() !== "");
      }
      return [];
    } catch (error) {
      console.error(`Error fetching resources for ${collectionName}:`, error);
      return [];
    }
  }, []);

  const toggleCollection = useCallback(async (collectionName) => {
    console.log(`Toggling collection: ${collectionName}`);
    setOpenCollections((prev) => ({
      ...prev,
      [collectionName]: !prev[collectionName],
    }));

    if (!loadingResources[collectionName]) {
      setLoadingResources((prev) => ({ ...prev, [collectionName]: true }));
      const resources = await fetchResourcesData(collectionName);
      console.log(`Resources fetched for ${collectionName}:`, resources);
      setCollections((prev) =>
        prev.map((c) =>
          c.collection_name === collectionName
            ? { ...c, resources, resourcesFetched: true }
            : c
        )
      );
      setLoadingResources((prev) => ({ ...prev, [collectionName]: false }));
    }
  }, [fetchResourcesData, loadingResources]);

  const toggleResource = (resourceName) => {
    setOpenResources((prev) => ({
      ...prev,
      [resourceName]: !prev[resourceName],
    }));
  };

  const handleDeleteCollection = async (collectionName) => {
    const confirmed = window.confirm(`Are you sure you want to delete the collection "${collectionName}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await deleteCollection(collectionName);
      setCollections((prev) =>
        prev.filter((collection) => collection.collection_name !== collectionName)
      );
      toast.success(`Collection "${collectionName}" deleted successfully`);
    } catch (error) {
      console.error(`Error deleting collection ${collectionName}:`, error);
      toast.error(`Failed to delete collection "${collectionName}"`);
    }
  };

  const handleDeleteResource = async (collectionName, resourceName) => {
    const confirmed = window.confirm(`Are you sure you want to delete the resource "${resourceName}" from the collection "${collectionName}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await deleteResource(collectionName, resourceName);
      setCollections((prev) =>
        prev.map((collection) =>
          collection.collection_name === collectionName
            ? {
                ...collection,
                resources: collection.resources.filter(
                  (resource) => resource.resource_name !== resourceName
                ),
              }
            : collection
        )
      );
      toast.success(`Resource "${resourceName}" deleted successfully`);
    } catch (error) {
      console.error(`Error deleting resource ${resourceName}:`, error);
      toast.error(`Failed to delete resource "${resourceName}"`);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // You can add search functionality here if needed
    }
  };

  const filteredCollections = collections.filter((collection) =>
    collection.collection_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Current collections state:", collections);

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
            Manage Collections and Resources
          </h3>
          <div className="flex items-center gap-4">
          <CreateCollection updateCollections={updateCollections} />
          <AddResourceToCollection collections={collections} updateCollections={updateCollections} />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 mb-6">
          <input
            type="text"
            placeholder="Search by collection name"
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <p>Loading collections...</p>
          </div>
        ) : (
          filteredCollections.map((collection) => (
            <div
              key={collection.collection_name}
              className="border rounded-lg shadow-sm overflow-hidden bg-white mb-4"
            >
              <button
                onClick={() => toggleCollection(collection.collection_name)}
                className="w-full px-4 py-3 text-left font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 focus:outline-none flex justify-between items-center"
              >
                <span>{collection.collection_name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCollection(collection.collection_name);
                    }}
                    className="px-4 py-2 text-red-600 bg-red-50 rounded-lg duration-150 hover:bg-red-100 active:bg-red-200"
                  >
                    Delete
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openCollections[collection.collection_name]
                        ? "transform rotate-180"
                        : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>
              {openCollections[collection.collection_name] && (
                <div className="px-4 py-3">
                  {loadingResources[collection.collection_name] ? (
                    <div className="flex items-center justify-center py-4">
                      <LoadingSpinner />
                      <p>Loading resources...</p>
                    </div>
                  ) : collection.resources && collection.resources.length === 0 ? (
                    <p className="text-gray-500 italic">No resources found</p>
                  ) : (
                    collection.resources && collection.resources.map((resource) => (
                      <div
                        key={resource.resource_name}
                        className="mb-4 last:mb-0"
                      >
                        <button
                          onClick={() => toggleResource(resource.resource_name)}
                          className="w-full py-2 text-left text-gray-700 hover:text-gray-900 focus:outline-none flex justify-between items-center"
                        >
                          <span>{resource.resource_name}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResource(collection.collection_name, resource.resource_name);
                              }}
                              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg duration-150 hover:bg-red-100 active:bg-red-200"
                            >
                              Delete
                            </button>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                openResources[resource.resource_name]
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </button>
                        {openResources[resource.resource_name] && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="mb-1">
                              <span className="font-semibold">Title:</span>{" "}
                              {resource.resource_name}
                            </p>
                            <p className="mb-1">
                              <span className="font-semibold">Link:</span>{" "}
                              <a
                                href={resource.link}
                                className="text-indigo-600 hover:text-indigo-800 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {resource.link}
                              </a>
                            </p>
                            <p>
                              <span className="font-semibold">Description:</span>{" "}
                              {resource.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default DeleteCollectionAndResource;