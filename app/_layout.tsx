import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import AdminNavigator from "@/navigation/AdminNavigator";

export default function Layout(): React.JSX.Element {
  return (
    <AuthProvider>
      <AdminNavigator/>
    </AuthProvider>
  );
}
