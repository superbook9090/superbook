'use client';

import Link from 'next/link';
import { useState, useMemo, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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

  // Memoize theme classes to avoid recalculation on every render
  const themeClasses = useMemo(() => {
    const isGreen = colorScheme === 'green' || colorScheme === 'emerald';
    return {
      bg: isGreen ? 'bg-emerald-700' : 'bg-indigo-700',
      active: isGreen ? 'bg-emerald-800' : 'bg-indigo-800',
      hover: isGreen ? 'hover:bg-emerald-600' : 'hover:bg-indigo-600',
    };
  }, [colorScheme]);

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
          <h1 className="text-white text-xl font-bold">SuperBook</h1>
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
                    className={`${
                      pathname === item.href
                        ? `${themeClasses.active} text-white`
                        : `text-white/90 ${themeClasses.hover}`
                    } group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors`}
                  >
                    {renderIcon(item.icon)}
                    <span className="truncate">{item.name}</span>
                  </Link>
                ) : (
                  <div key={item.name} className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                    {item.name}
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
                Sign out
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

export default memo(MobileNav);
