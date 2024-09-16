import React, { useState, useEffect, useCallback, useRef } from 'react';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { FaBook, FaDownload, FaTrash, FaSearch, FaUpload, FaEye, FaSync, FaSpinner } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Modal from 'react-modal';
import './DisplayBooks.css';
import { aws_access_key, aws_secret_access_key, aws_bucket_name, aws_region } from '../utils/config';

Modal.setAppElement('#root');

const S3_CONFIG = {
  region: aws_region,
  credentials: {
    accessKeyId: aws_access_key,
    secretAccessKey: aws_secret_access_key,
  },
};

const BUCKET_NAME = aws_bucket_name;

const FileViewer = ({ fileUrl }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [fileUrl]);

  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileUrl);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (isPdf) {
    return (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
        width="100%"
        height="600px"
        style={{ border: 'none' }}
      ></iframe>
    );
  } else if (isImage) {
    return (
      <iframe
        src={fileUrl}
        width="100%"
        height="600px"
        style={{ border: 'none' }}
      ></iframe>
    );
  } else {
    return <p>Unsupported file type</p>;
  }
};

const DisplayBooks = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [fileToView, setFileToView] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const s3Client = new S3Client(S3_CONFIG);
  const viewerRef = useRef(null);

  const refreshFileList = useCallback(async () => {
    if (isFetching || refreshing) return;
    setRefreshing(true);
    setIsFetching(true);
    try {
      const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
      const response = await s3Client.send(command);
      const fileList = response.Contents || [];
      const processedFileList = fileList.map(file => ({
        ...file,
        SizeMB: (file.Size / (1024 * 1024)).toFixed(2),
        isPdf: file.Key.toLowerCase().endsWith('.pdf')
      }));
      setFiles(processedFileList);
    } catch (err) {
      console.error('Error fetching file list:', err);
      toast.error('Failed to fetch files. Please try again.');
    } finally {
      setIsFetching(false);
      setRefreshing(false);
    }
  }, [s3Client, isFetching, refreshing]);

  useEffect(() => {
    refreshFileList();
  }, []);

  const handleRefresh = () => {
    refreshFileList();
  };

  const deleteFile = async (key) => {
    setIsDeleting(true);
    try {
      const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key });
      await s3Client.send(command);
      refreshFileList();
      toast.success('File deleted successfully');
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const checkFileExists = async (fileName) => {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
      });
      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);
    for (let file of files) {
      if (file.type !== 'application/pdf') {
        toast.error(`Only PDF files can be uploaded. "${file.name}" was skipped.`);
        continue;
      }

      try {
        const fileExists = await checkFileExists(file.name);
        if (fileExists) {
          toast.error(`File "${file.name}" already exists. Upload skipped.`);
          continue;
        }
  
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.name,
          Body: file,
          ContentType: file.type
        });
  
        await s3Client.send(command);
        toast.success(`${file.name} uploaded successfully`);
      } catch (err) {
        console.error('Error uploading file:', err);
        toast.error(`Failed to upload ${file.name}. Please try again.`);
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
    setIsUploading(false);
    refreshFileList();
  };

  const handleFileUpload = (event) => {
    const filesToUpload = Array.from(event.target.files).filter(file => file.type === 'application/pdf');
    if (filesToUpload.length > 0) {
      setUploadProgress(Object.fromEntries(filesToUpload.map(file => [file.name, 0])));
      uploadFiles(filesToUpload);
    } else {
      toast.error('No PDF files selected. Only PDF files can be uploaded.');
    }
  };

  const openFileViewer = (fileKey) => {
    const fileUrl = `https://${BUCKET_NAME}.s3.${S3_CONFIG.region}.amazonaws.com/${encodeURIComponent(fileKey)}`;
    setFileToView({ url: fileUrl, key: fileKey });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFileToView(null);
  };

  const downloadFile = async (fileKey) => {
    try {
      const url = `https://${BUCKET_NAME}.s3.${S3_CONFIG.region}.amazonaws.com/${encodeURIComponent(fileKey)}`;
      
      const response = await fetch(url);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileKey.split('/').pop();
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const filteredFiles = files.filter(file => 
    file.Key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="mb-8 flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Digital Library</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search books..."
              className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <label className="px-3 py-1.5 text-sm text-indigo-600 duration-150 bg-indigo-50 rounded-lg hover:bg-indigo-100 active:bg-indigo-200 cursor-pointer">
            Upload Book
            <input type="file" className="hidden" onChange={handleFileUpload} multiple />
          </label>
          <button 
            onClick={handleRefresh} 
            className={`px-3 py-1.5 text-sm text-indigo-600 duration-150 bg-indigo-50 rounded-lg hover:bg-indigo-100 active:bg-indigo-200 flex items-center space-x-1 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={refreshing}
          >
            {refreshing && <FaSync className="animate-spin" />}
            Refresh
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center justify-center mb-4">
          <FaSpinner className="animate-spin mr-2" />
          <span>UPLOADING</span>
        </div>
      )}

      {isDeleting && (
        <div className="flex items-center justify-center mb-4">
          <FaSpinner className="animate-spin mr-2" />
          <span>DELETING</span>
        </div>
      )}

      {files.length === 0 && !isFetching && !refreshing ? (
        <div className="text-center py-8 text-gray-500">No books available</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaBook className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{file.Key}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{file.SizeMB} MB</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="action-buttons">
                      <button 
                        onClick={() => openFileViewer(file.Key)} 
                        className={`text-green-600 hover:text-green-900 mr-4 ${!file.isPdf && !/\.(jpg|jpeg|png|gif|bmp)$/i.test(file.Key) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!file.isPdf && !/\.(jpg|jpeg|png|gif|bmp)$/i.test(file.Key)}
                      >
                        <FaEye className="inline-block mr-1" /> View
                      </button>
                      <button onClick={() => downloadFile(file.Key)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <FaDownload className="inline-block mr-1" /> Download
                      </button>
                      <button 
                        onClick={() => deleteFile(file.Key)} 
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        <FaTrash className="inline-block mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="File Viewer"
        className="modal"
        overlayClassName="overlay"
      >
        <div className="file-viewer">
          <button onClick={closeModal} className="close-button">Close</button>
          {fileToView && <FileViewer fileUrl={fileToView.url} />}
        </div>
      </Modal>

      <iframe
        ref={viewerRef}
        src="https://docs.google.com/viewer?embedded=true"
        style={{ display: 'none' }}
      ></iframe>
    </div>
  );
};

export default DisplayBooks;