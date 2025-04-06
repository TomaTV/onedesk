"use client";
import { SessionProvider } from "next-auth/react";
import PermissionFixer from "./PermissionFixer";

const AuthProvider = ({ children }) => {
  return (
    <SessionProvider>
      <PermissionFixer />
      {children}
    </SessionProvider>
  );
};

export default AuthProvider;
