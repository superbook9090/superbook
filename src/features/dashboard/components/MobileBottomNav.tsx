'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  HelpCircle,
  TrendingUp,
  User,
  BarChart3,
  Library,
  Folder,
  Mail,
  LucideIcon
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  Search,
  HelpCircle,
  TrendingUp,
  User,
  BarChart3,
  Library,
  Folder,
  Mail,
};

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface MobileBottomNavProps {
  navigation: NavItem[];
}

function MobileBottomNav({ navigation }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Memoize theme classes using dynamic CSS variables
  const themeClasses = useMemo(() => {
    return {
      activeColor: 'text-[var(--primary)]',
      activeBg: 'bg-[var(--primary-soft)]',
    };
  }, []);

  // Memoize nav items to prevent unnecessary slice operations
  const bottomNavItems = useMemo(() => navigation.slice(0, 5), [navigation]);

  // Helper to render icon
  const renderIcon = (iconName: string, isActive: boolean) => {
    const Icon = iconMap[iconName];
    if (Icon) {
      return <Icon className={`w-5 h-5 ${isActive ? themeClasses.activeColor : 'text-gray-500'}`} />;
    }
    return null;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1 py-2 transition-colors ${
                isActive ? `${themeClasses.activeColor} ${themeClasses.activeBg}` : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {renderIcon(item.icon, isActive)}
              <span className="text-[10px] mt-0.5 truncate max-w-[4rem] leading-tight">{t(item.name)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
