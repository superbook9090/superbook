// Centralized role-based theme configuration
export type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin';

export interface RoleTheme {
  // Gradient classes for primary buttons
  gradient: string;
  // Solid color for backgrounds
  primary: string;
  // Hover state
  hover: string;
  // Text color
  text: string;
  // Border color
  border: string;
  // Accent color for badges, highlights
  accent: string;
  // Background color for active states
  activeBg: string;
  // Text color for active states
  activeText: string;
  // Actual color values for inline styles
  colors: {
    primary: string;
    primaryHover: string;
    text: string;
    border: string;
    activeBg: string;
  };
}

export const roleThemes: Record<UserRole, RoleTheme> = {
  student: {
    gradient: 'from-indigo-500 via-violet-500 to-purple-500',
    primary: 'bg-indigo-500',
    hover: 'hover:bg-indigo-600',
    text: 'text-indigo-500',
    border: 'border-indigo-400',
    accent: 'text-violet-500',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-600',
    colors: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      text: '#6366f1',
      border: '#818cf8',
      activeBg: '#eef2ff',
    },
  },

  teacher: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    primary: 'bg-emerald-500',
    hover: 'hover:bg-emerald-600',
    text: 'text-emerald-500',
    border: 'border-emerald-400',
    accent: 'text-teal-500',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-600',
    colors: {
      primary: '#10b981',
      primaryHover: '#059669',
      text: '#10b981',
      border: '#34d399',
      activeBg: '#ecfdf5',
    },
  },

  admin: {
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    primary: 'bg-rose-500',
    hover: 'hover:bg-rose-600',
    text: 'text-rose-500',
    border: 'border-rose-400',
    accent: 'text-pink-500',
    activeBg: 'bg-rose-50',
    activeText: 'text-rose-600',
    colors: {
      primary: '#f43f5e',
      primaryHover: '#e11d48',
      text: '#f43f5e',
      border: '#fb7185',
      activeBg: '#fff1f2',
    },
  },

  superadmin: {
    gradient: 'from-slate-800 via-gray-900 to-black',
    primary: 'bg-slate-800',
    hover: 'hover:bg-slate-900',
    text: 'text-slate-800',
    border: 'border-slate-600',
    accent: 'text-gray-700',
    activeBg: 'bg-slate-100',
    activeText: 'text-slate-900',
    colors: {
      primary: '#1e293b',
      primaryHover: '#0f172a',
      text: '#1e293b',
      border: '#475569',
      activeBg: '#f1f5f9',
    },
  },
};

// Helper function to get theme for a role
export function getRoleTheme(role: string = 'student'): RoleTheme {
  const normalizedRole = role.toLowerCase() as UserRole;
  return roleThemes[normalizedRole] || roleThemes.student;
}

// Helper to get color scheme for layout (legacy support)
export function getColorScheme(role: string = 'student'): 'indigo' | 'blue' | 'red' | 'gray' {
  const themeMap: Record<string, 'indigo' | 'blue' | 'red' | 'gray'> = {
    student: 'indigo',
    teacher: 'blue',
    admin: 'red',
    superadmin: 'gray',
  };
  return themeMap[role.toLowerCase()] || 'indigo';
}
