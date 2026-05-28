'use client';

import type { SVGProps } from 'react';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Globe,
  GraduationCap,
  HelpCircle,
  Languages,
  Shield,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';

type IconProps = SVGProps<SVGSVGElement>;

export type HomeHighlightKey = 'courses' | 'quizzes' | 'languages';

export type HomeAboutCapabilityKey =
  | 'roleBasedAccess'
  | 'realtimeAnalytics'
  | 'multiLanguage'
  | 'organizedContent';

export type HomeHowItWorksStep = 'step1' | 'step2' | 'step3';

export type HomeRoleKey = 'student' | 'teacher' | 'admin';

export function HomeHighlightIcon({
  highlightKey,
  ...props
}: IconProps & { highlightKey: HomeHighlightKey }) {
  switch (highlightKey) {
    case 'courses':
      return <BookOpen {...props} />;
    case 'quizzes':
      return <HelpCircle {...props} />;
    case 'languages':
      return <Languages {...props} />;
    default:
      return <BookOpen {...props} />;
  }
}

export function HomeAboutCapabilityIcon({
  capabilityKey,
  ...props
}: IconProps & { capabilityKey: HomeAboutCapabilityKey }) {
  switch (capabilityKey) {
    case 'roleBasedAccess':
      return <Shield {...props} />;
    case 'realtimeAnalytics':
      return <BarChart3 {...props} />;
    case 'multiLanguage':
      return <Globe {...props} />;
    case 'organizedContent':
      return <ClipboardList {...props} />;
    default:
      return <Shield {...props} />;
  }
}

export function HomeHowItWorksIcon({
  step,
  ...props
}: IconProps & { step: HomeHowItWorksStep }) {
  switch (step) {
    case 'step1':
      return <UserPlus {...props} />;
    case 'step2':
      return <BookOpen {...props} />;
    case 'step3':
      return <Trophy {...props} />;
    default:
      return <UserPlus {...props} />;
  }
}

export function HomeRoleIcon({ roleKey, ...props }: IconProps & { roleKey: HomeRoleKey }) {
  switch (roleKey) {
    case 'student':
      return <GraduationCap {...props} />;
    case 'teacher':
      return <Users {...props} />;
    case 'admin':
      return <Shield {...props} />;
    default:
      return <GraduationCap {...props} />;
  }
}
