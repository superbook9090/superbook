'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface MobileBottomNavProps {
  navigation: NavItem[];
  colorScheme: 'indigo' | 'green';
}

function MobileBottomNav({ navigation, colorScheme }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    activeColor: colorScheme === 'indigo' ? 'text-indigo-600' : 'text-green-600',
    activeBg: colorScheme === 'indigo' ? 'bg-indigo-50' : 'bg-green-50',
  }), [colorScheme]);

  // Memoize nav items to prevent unnecessary slice operations
  const bottomNavItems = useMemo(() => navigation.slice(0, 5), [navigation]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1 ${
                isActive ? `${themeClasses.activeColor} ${themeClasses.activeBg}` : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="h-5 w-5">{item.icon}</span>
              <span className="text-xs mt-0.5 truncate max-w-full">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(MobileBottomNav);
