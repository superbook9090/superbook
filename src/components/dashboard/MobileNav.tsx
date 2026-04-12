'use client';

import Link from 'next/link';
import { useState, useMemo, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

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
  colorScheme: 'indigo' | 'green';
}

// Memoize the component to prevent unnecessary re-renders
function MobileNav({ user, navigation, adminNavigation = [], colorScheme }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';

  // Memoize theme classes to avoid recalculation on every render
  const themeClasses = useMemo(() => ({
    bg: colorScheme === 'indigo' ? 'bg-indigo-700' : 'bg-green-700',
    active: colorScheme === 'indigo' ? 'bg-indigo-800' : 'bg-green-800',
    hover: colorScheme === 'indigo' ? 'hover:bg-indigo-600' : 'hover:bg-green-600',
  }), [colorScheme]);

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

  return (
    <>
      {/* Mobile Header */}
      <div className={`${themeClasses.bg} md:hidden`}>
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-white text-xl font-bold">SuperBook</h1>
          <button
            onClick={toggleMenu}
            className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`${themeClasses.bg} border-t border-opacity-20 border-white pb-4`}>
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
                        : `text-white ${themeClasses.hover}`
                    } group flex items-center px-3 py-3 text-base font-medium rounded-md`}
                  >
                    <span className="truncate">{item.name}</span>
                  </Link>
                ) : (
                  <div key={item.name} className="px-3 py-2 text-xs font-semibold text-white opacity-60 uppercase tracking-wider">
                    {item.name}
                  </div>
                )
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-opacity-20 border-white px-4">
              <div className="text-white">
                <div className="text-base font-medium">{user?.name}</div>
                <div className="text-sm opacity-80">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-3 w-full bg-white bg-opacity-20 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(MobileNav);
