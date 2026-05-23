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
    gradient: 'from-[var(--student-primary)] via-[var(--student-primary)] to-[var(--student-accent)]',
    primary: 'bg-[var(--student-primary)]',
    hover: 'hover:bg-[var(--student-hover)]',
    text: 'text-[var(--student-primary)]',
    border: 'border-[var(--student-border)]',
    accent: 'text-[var(--student-accent)]',
    activeBg: 'bg-[var(--student-soft)]',
    activeText: 'text-[var(--student-hover)]',
    shadow: 'shadow-[var(--student-shadow)]',
    colors: {
      primary: 'var(--student-primary)',
      primaryHover: 'var(--student-hover)',
      text: 'var(--student-primary)',
      border: 'var(--student-border)',
      activeBg: 'var(--student-soft)',
      shadow: 'var(--student-shadow)',
    },
  },

  teacher: {
    gradient: 'from-[var(--teacher-primary)] via-[var(--teacher-primary)] to-[var(--teacher-accent)]',
    primary: 'bg-[var(--teacher-primary)]',
    hover: 'hover:bg-[var(--teacher-hover)]',
    text: 'text-[var(--teacher-primary)]',
    border: 'border-[var(--teacher-border)]',
    accent: 'text-[var(--teacher-accent)]',
    activeBg: 'bg-[var(--teacher-soft)]',
    activeText: 'text-[var(--teacher-hover)]',
    shadow: 'shadow-[var(--teacher-shadow)]',
    colors: {
      primary: 'var(--teacher-primary)',
      primaryHover: 'var(--teacher-hover)',
      text: 'var(--teacher-primary)',
      border: 'var(--teacher-border)',
      activeBg: 'var(--teacher-soft)',
      shadow: 'var(--teacher-shadow)',
    },
  },

  admin: {
    gradient: 'from-[var(--teacher-primary)] via-[var(--teacher-primary)] to-[var(--teacher-accent)]',
    primary: 'bg-[var(--teacher-primary)]',
    hover: 'hover:bg-[var(--teacher-hover)]',
    text: 'text-[var(--teacher-primary)]',
    border: 'border-[var(--teacher-border)]',
    accent: 'text-[var(--teacher-accent)]',
    activeBg: 'bg-[var(--teacher-soft)]',
    activeText: 'text-[var(--teacher-hover)]',
    shadow: 'shadow-[var(--teacher-shadow)]',
    colors: {
      primary: 'var(--teacher-primary)',
      primaryHover: 'var(--teacher-hover)',
      text: 'var(--teacher-primary)',
      border: 'var(--teacher-border)',
      activeBg: 'var(--teacher-soft)',
      shadow: 'var(--teacher-shadow)',
    },
  },

  superadmin: {
    gradient: 'from-[var(--teacher-primary)] via-[var(--teacher-primary)] to-[var(--teacher-accent)]',
    primary: 'bg-[var(--teacher-primary)]',
    hover: 'hover:bg-[var(--teacher-hover)]',
    text: 'text-[var(--teacher-primary)]',
    border: 'border-[var(--teacher-border)]',
    accent: 'text-[var(--teacher-accent)]',
    activeBg: 'bg-[var(--teacher-soft)]',
    activeText: 'text-[var(--teacher-hover)]',
    shadow: 'shadow-[var(--teacher-shadow)]',
    colors: {
      primary: 'var(--teacher-primary)',
      primaryHover: 'var(--teacher-hover)',
      text: 'var(--teacher-primary)',
      border: 'var(--teacher-border)',
      activeBg: 'var(--teacher-soft)',
      shadow: 'var(--teacher-shadow)',
    },
  },
};

// Helper function to get theme for a role
export function getRoleTheme(role: string = 'student'): RoleTheme {
  const normalizedRole = role.toLowerCase() as UserRole;
  return roleThemes[normalizedRole] || roleThemes.student;
}
