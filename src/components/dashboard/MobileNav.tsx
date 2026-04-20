'use client';

import Link from 'next/link';
import { useState, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  HelpCircle,
  TrendingUp,
  User,
  BarChart3,
  Users,
  Library,
  Menu,
  X,
  LogOut,
  LucideIcon
} from 'lucide-react';

// Icon mapping for navigation items
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  Search,
  HelpCircle,
  TrendingUp,
  User,
  BarChart3,
  Users,
  Library,
};

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface MobileNavProps {
  user: User | null;
  navigation: NavItem[];
  adminNavigation?: NavItem[];
  colorScheme: 'indigo' | 'green' | 'emerald';
}

// Memoize the component to prevent unnecessary re-renders
function MobileNav({ user, navigation, adminNavigation = [], colorScheme }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';
  const { t, lang, setLang } = useTranslation();
  const { theme } = useRoleTheme();

  // Memoize theme classes to avoid recalculation on every render
  const themeClasses = useMemo(() => {
    return {
      bg: `bg-gradient-to-r ${theme.gradient}`,
      active: `bg-gradient-to-r ${theme.gradient}`,
      hover: 'hover:opacity-80',
    };
  }, [theme]);

  // Memoize navigation items to prevent unnecessary array creation
  const allNavItems = useMemo(() => {
    if (isAdmin && adminNavigation.length > 0) {
      return [...navigation, { name: '— Admin —', href: '', icon: '' }, ...adminNavigation];
    }
    return navigation;
  }, [isAdmin, navigation, adminNavigation]);

  // Memoize toggle handler
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const handleSignOut = useCallback(() => signOut({ callbackUrl: '/login' }), []);

  // Helper to render icon
  const renderIcon = (iconName: string, className?: string) => {
    const Icon = iconMap[iconName];
    if (Icon) {
      return <Icon className={className || 'w-5 h-5 mr-3'} />;
    }
    return null;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className={`${themeClasses.bg} md:hidden fixed top-0 left-0 right-0 z-50`}>
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={isAdmin ? '/dashboard/teacher' : '/dashboard/student'} className="flex items-center gap-3 group">
            <img
              src="/logo.svg"
              alt="Super Book Logo"
              className="h-11 w-auto bg-transparent object-contain transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            />
            <span className="text-base font-semibold text-white leading-none tracking-tight">SUPER BOOK</span>
          </Link>
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'hi')}
              className="px-2 py-1 bg-white/20 border border-white/30 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="en" className="text-gray-900">EN</option>
              <option value="hi" className="text-gray-900">HI</option>
            </select>
            <button
              onClick={toggleMenu}
              className="text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95 transition-transform"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`${themeClasses.bg} border-t border-white/20 pb-4 max-h-[calc(100vh-64px)] overflow-y-auto`}>
            <nav className="px-2 space-y-1">
              {allNavItems.map((item) => (
                item.href ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      pathname === item.href
                        ? `${themeClasses.active} text-white shadow-lg backdrop-blur-sm`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`mr-3 p-1.5 rounded-lg transition-colors ${
                      pathname === item.href ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/10'
                    }`}>
                      {renderIcon(item.icon)}
                    </div>
                    {t(item.name)}
                  </Link>
                ) : (
                  <div key={item.name} className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                    {t(item.name)}
                  </div>
                )
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-white/20 px-4">
              <div className="text-white">
                <div className="text-base font-medium truncate">{user?.name}</div>
                <div className="text-sm text-white/70 truncate">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-3 w-full bg-white/20 text-white px-4 py-2.5 rounded-lg text-base font-medium hover:bg-white/30 active:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {t('common.signOut')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spacer for fixed header */}
      <div className="h-14 md:hidden" />
    </>
  );
}

export default MobileNav;
