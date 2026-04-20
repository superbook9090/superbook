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
    gradient: 'from-indigo-600 to-purple-600',
    primary: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-indigo-600',
    border: 'border-indigo-500',
    accent: 'text-indigo-600',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-700',
    colors: {
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      text: '#4f46e5',
      border: '#6366f1',
      activeBg: '#eef2ff',
    },
  },
  teacher: {
    gradient: 'from-blue-600 to-cyan-500',
    primary: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600',
    border: 'border-blue-500',
    accent: 'text-blue-600',
    activeBg: 'bg-blue-50',
    activeText: 'text-blue-700',
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      text: '#2563eb',
      border: '#3b82f6',
      activeBg: '#eff6ff',
    },
  },
  admin: {
    gradient: 'from-red-600 to-pink-600',
    primary: 'bg-red-600',
    hover: 'hover:bg-red-700',
    text: 'text-red-600',
    border: 'border-red-500',
    accent: 'text-red-600',
    activeBg: 'bg-red-50',
    activeText: 'text-red-700',
    colors: {
      primary: '#dc2626',
      primaryHover: '#b91c1c',
      text: '#dc2626',
      border: '#ef4444',
      activeBg: '#fef2f2',
    },
  },
  superadmin: {
    gradient: 'from-gray-900 to-black',
    primary: 'bg-gray-900',
    hover: 'hover:bg-gray-800',
    text: 'text-gray-900',
    border: 'border-gray-700',
    accent: 'text-gray-900',
    activeBg: 'bg-gray-100',
    activeText: 'text-gray-900',
    colors: {
      primary: '#111827',
      primaryHover: '#1f2937',
      text: '#111827',
      border: '#374151',
      activeBg: '#f3f4f6',
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
