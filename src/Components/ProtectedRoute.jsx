// Example of protected routes with roles
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Custom hook or context for authentication

const ProtectedRoute = ({ element: Component, allowedRoles, ...rest }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Route
      {...rest}
      element={
        user && allowedRoles.includes(user.role) ? (
          <Component />
        ) : (
          <Navigate to="/unauthorized" replace />
        )
      }
    />
  );
};

export default ProtectedRoute;