// Centralized role-based theme configuration
export type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin';

export interface RoleTheme {
  // Gradient classes for primary buttons (subtle, premium)
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
  // Shadow color for glowing effects
  shadow: string;
  // Actual color values for inline styles
  colors: {
    primary: string;
    primaryHover: string;
    text: string;
    border: string;
    activeBg: string;
    shadow: string;
  };
}

export const roleThemes: Record<UserRole, RoleTheme> = {
  student: {
    gradient: 'from-indigo-600 to-violet-600',
    primary: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    accent: 'text-violet-500',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-700',
    shadow: 'shadow-indigo-500/25',
    colors: {
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      text: '#4f46e5',
      border: '#c7d2fe',
      activeBg: '#eef2ff',
      shadow: 'rgba(79, 70, 229, 0.25)',
    },
  },

  teacher: {
    gradient: 'from-emerald-600 to-teal-600',
    primary: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    accent: 'text-teal-500',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    shadow: 'shadow-emerald-500/25',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      text: '#059669',
      border: '#a7f3d0',
      activeBg: '#ecfdf5',
      shadow: 'rgba(5, 150, 105, 0.25)',
    },
  },

  admin: {
    gradient: 'from-emerald-600 to-teal-600',
    primary: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    accent: 'text-teal-500',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    shadow: 'shadow-emerald-500/25',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      text: '#059669',
      border: '#a7f3d0',
      activeBg: '#ecfdf5',
      shadow: 'rgba(5, 150, 105, 0.25)',
    },
  },

  superadmin: {
    gradient: 'from-emerald-600 to-teal-600',
    primary: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    accent: 'text-teal-500',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    shadow: 'shadow-emerald-500/25',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      text: '#059669',
      border: '#a7f3d0',
      activeBg: '#ecfdf5',
      shadow: 'rgba(5, 150, 105, 0.25)',
    },
  },
};

// Helper function to get theme for a role
export function getRoleTheme(role: string = 'student'): RoleTheme {
  const normalizedRole = role.toLowerCase() as UserRole;
  return roleThemes[normalizedRole] || roleThemes.student;
}
