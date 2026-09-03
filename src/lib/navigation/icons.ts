import type { LucideIcon } from 'lucide-react';
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
  Building2,
  Folder,
  Mail,
  Bell,
  Heart,
  Newspaper,
  Award,
  Notebook,
  Trophy,
} from 'lucide-react';
import type { NavIconName } from '@/constants/navigation';

export const NAV_ICON_MAP: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  Search,
  HelpCircle,
  TrendingUp,
  User,
  BarChart3,
  Users,
  Library,
  Building2,
  Folder,
  Mail,
  Bell,
  Heart,
  Newspaper,
  Award,
  Notebook,
  Trophy,
};

export function getNavIcon(name: NavIconName): LucideIcon {
  return NAV_ICON_MAP[name];
}
