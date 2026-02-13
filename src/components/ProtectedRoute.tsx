import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: React.ReactElement;
};

export default function ProtectedRoute({ children }: Props) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
