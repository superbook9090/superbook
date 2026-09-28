'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  ShieldCheck,
  RefreshCw,
  Crown,
  Bell,
  CalendarIcon,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from 'date-fns';

interface AdminHeroProps {
  userName?: string;
  isSuperAdmin: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

export default function AdminHero({
  userName,
  isSuperAdmin,
  isRefreshing,
  onRefresh,
  dateRange,
  onDateRangeChange,
}: AdminHeroProps) {
  const { t } = useTranslation();

  const displayName = useMemo(() => {
    if (!userName) return '';
    return userName.charAt(0).toUpperCase() + userName.slice(1);
  }, [userName]);

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    
    onDateRangeChange({
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    });
  };

  const parsedStartDate = useMemo(() => dateRange.startDate ? parseISO(dateRange.startDate) : undefined, [dateRange.startDate]);
  const parsedEndDate = useMemo(() => dateRange.endDate ? parseISO(dateRange.endDate) : undefined, [dateRange.endDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative overflow-hidden p-6 sm:p-10 rounded-[2rem] border backdrop-blur-2xl shadow-xl group ${
        isSuperAdmin
          ? 'border-amber-500/40 bg-[var(--card-solid)]/30'
          : 'border-[var(--border)]/50 bg-[var(--card-solid)]/40'
      }`}
    >
      {/* Decorative ambient gradients */}
      <div 
        className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none ${
          isSuperAdmin ? 'bg-amber-500/20' : 'bg-[var(--teacher-primary)]/20'
        }`} 
      />
      <div 
        className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none ${
          isSuperAdmin ? 'bg-purple-500/20' : 'bg-blue-500/20'
        }`} 
      />

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-8">
        <div className="space-y-4 max-w-2xl min-w-[320px] flex-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm ${
              isSuperAdmin 
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' 
                : 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]/50'
            }`}
          >
            {isSuperAdmin ? <Crown className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isSuperAdmin ? t('admin.superadminTier') : t('admin.adminSuite')}</span>
          </motion.div>
          
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            >
              {t('dashboard.welcomeBack')}{displayName ? `, ` : '!'}
              {displayName && (
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isSuperAdmin ? 'from-amber-400 to-amber-600' : 'from-[var(--teacher-primary)] to-blue-500'}`}>
                  {displayName}!
                </span>
              )}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-lg text-[var(--color-muted-foreground)] font-medium max-w-xl flex flex-wrap items-center gap-2"
            >
              <span>{t('admin.adminDesc')}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
                </span>
                {t('admin.systemsOperational')}
              </span>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-end sm:items-center gap-4 pt-2 md:pt-0 shrink-0 ml-auto"
        >
          {isSuperAdmin && (
            <div className="inline-flex flex-col sm:flex-row items-end sm:items-center gap-2 p-1.5 rounded-2xl bg-[var(--card-solid)]/60 backdrop-blur-md border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-1 px-2 border-b sm:border-b-0 sm:border-r border-[var(--border)]/60 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setPreset(1)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
                >
                  {t('admin.presetToday')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(7)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
                >
                  {t('admin.preset7D')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(30)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
                >
                  {t('admin.preset30D')}
                </button>
              </div>

              <div className="flex items-center px-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center justify-between gap-3 px-3 py-1.5 text-xs font-bold text-[var(--color-foreground)] rounded-xl hover:bg-[var(--surface-muted)] transition-colors border border-transparent hover:border-[var(--border)] cursor-pointer outline-none">
                      {parsedStartDate ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            {format(parsedStartDate, "dd/MM/yyyy")}
                            <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                          </div>
                          {parsedEndDate && (
                            <>
                              <span className="text-[var(--color-muted-foreground)] text-[9px] uppercase font-extrabold">TO</span>
                              <div className="flex items-center gap-1.5">
                                {format(parsedEndDate, "dd/MM/yyyy")}
                                <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Pick a date range</span>
                          <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                        </div>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      autoFocus
                      mode="range"
                      defaultMonth={parsedStartDate}
                      selected={{ from: parsedStartDate, to: parsedEndDate }}
                      onSelect={(range) => {
                        onDateRangeChange({
                          startDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
                          endDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
                        });
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Link
                href={ROUTES.admin.notifications}
                className="group/btn relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 hover:shadow-lg transition-all duration-300 min-h-[44px]"
              >
                <Bell className="w-4 h-4 group-hover/btn:animate-wiggle" />
                <span className="hidden sm:inline">{t('admin.broadcastDispatcher')}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--card-solid)]/60 backdrop-blur-md text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface-muted)] hover:shadow-lg active:scale-95 transition-all duration-300 min-h-[44px] cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-[var(--primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
