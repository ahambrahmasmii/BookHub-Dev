import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = useSelector(state => state.user);
  const isAuthenticated = !!user.email;

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/books" />;
  }

  return children;
};

export default ProtectedRoute;