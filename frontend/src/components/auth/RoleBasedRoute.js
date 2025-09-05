import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles, userRole }) => {
  // If no user role is provided, redirect to login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not in allowed roles, redirect to unauthorized page
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;
