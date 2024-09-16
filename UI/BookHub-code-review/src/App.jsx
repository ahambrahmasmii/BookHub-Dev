import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// Importing pages
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Hero from './pages/Hero';
import ConfirmEmail from './pages/ConfirmEmail';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

// Importing routes
import DisplayBooksRoute from './page_routes/DisplayBooksRoute';
import BorrowBookRoute from './page_routes/BorrowBookRoute';
import CollectionRoute from './page_routes/CollectionRoute';
import DeletePhysicalBookRoute from './page_routes/DeletePhysicalBookRoute';
import DeleteCollectionAndResourceRoute from './page_routes/DeleteCollectionAndResourceRoute';
import UserManagement from './page_routes/UserManagementRoute';

function App() {
  const user = useSelector(state => state.user);
  const isAuthenticated = !!user.email;

  console.log('User State:', user);


  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/books" /> : <Hero />} />
        <Route path="/signin" element={isAuthenticated ? <Navigate to="/books" /> : <Signin />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/books" /> : <Signup />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/books" /> : <ForgotPassword />} />
        <Route path="/verify-email" element={isAuthenticated ? <Navigate to="/books" /> : <ConfirmEmail />} />
        <Route 
          path="/books" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DisplayBooksRoute />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/borrow" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <BorrowBookRoute />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/collection" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CollectionRoute />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/DeletePhysicalBook" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
              <DeletePhysicalBookRoute />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/DeleteCollectionAndResource" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
              <DeleteCollectionAndResourceRoute />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/UserManagement" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </>
  );
}

export default App;