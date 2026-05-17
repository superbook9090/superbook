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
    gradient: 'from-teal-500 via-teal-600 to-cyan-400',
    primary: 'bg-teal-600',
    hover: 'hover:bg-teal-700',
    text: 'text-teal-600',
    border: 'border-teal-200',
    accent: 'text-cyan-500',
    activeBg: 'bg-teal-50/50',
    activeText: 'text-teal-700',
    shadow: 'shadow-teal-500/20',
    colors: {
      primary: '#0d9488',
      primaryHover: '#0f766e',
      text: '#0d9488',
      border: '#ccfbf1',
      activeBg: '#f0fdfa',
      shadow: 'rgba(13, 148, 136, 0.15)',
    },
  },

  teacher: {
    gradient: 'from-cyan-500 via-cyan-600 to-teal-400',
    primary: 'bg-cyan-600',
    hover: 'hover:bg-cyan-700',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    accent: 'text-teal-500',
    activeBg: 'bg-cyan-50/50',
    activeText: 'text-cyan-700',
    shadow: 'shadow-cyan-500/20',
    colors: {
      primary: '#0891b2',
      primaryHover: '#0e7490',
      text: '#0891b2',
      border: '#cffafe',
      activeBg: '#ecfeff',
      shadow: 'rgba(8, 145, 178, 0.15)',
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
