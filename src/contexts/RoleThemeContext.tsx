'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { UserRole, RoleTheme, getRoleTheme } from '@/lib/roleTheme';

interface RoleThemeContextType {
  role: UserRole;
  theme: RoleTheme;
}

const RoleThemeContext = createContext<RoleThemeContextType | undefined>(undefined);

interface RoleThemeProviderProps {
  role: string;
  children: ReactNode;
}

export function RoleThemeProvider({ role, children }: RoleThemeProviderProps) {
  const normalizedRole = (role?.toLowerCase() || 'student') as UserRole;
  const value = useMemo(
    () => ({ role: normalizedRole, theme: getRoleTheme(normalizedRole) }),
    [normalizedRole]
  );

  return (
    <RoleThemeContext.Provider value={value}>
      {children}
    </RoleThemeContext.Provider>
  );
}

export function useRoleTheme() {
  const context = useContext(RoleThemeContext);
  if (context === undefined) {
    // Fallback to student theme if context not available
    return { role: 'student' as UserRole, theme: getRoleTheme('student') };
  }
  return context;
}
