import { useRoleTheme } from '@/contexts/RoleThemeContext';

/**
 * Centralized theme hook for role-based theming
 * 
 * This hook provides the theme colors based on the user's role.
 * It should be used throughout the application instead of directly
 * accessing the RoleThemeContext.
 * 
 * @example
 * const theme = useTheme();
 * <Button className={theme.primary} />
 */
export function useTheme() {
  const { theme } = useRoleTheme();
  return theme;
}
