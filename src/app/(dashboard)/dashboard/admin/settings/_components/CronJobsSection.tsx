import React, { useState } from 'react';
import { Play, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export function CronJobsSection() {
  const [loadingJob, setLoadingJob] = useState<string | null>(null);
  const [result, setResult] = useState<{ job: string; success: boolean; message: string } | null>(null);

  const runJob = async (jobId: string, endpoint: string) => {
    setLoadingJob(jobId);
    setResult(null);
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Need to send admin session cookies automatically by browser, which is handled
        },
      });
      const data = await res.json();
      setResult({
        job: jobId,
        success: res.ok,
        message: data.message || (res.ok ? 'Job executed successfully' : 'Job failed'),
      });
    } catch (err) {
      setResult({
        job: jobId,
        success: false,
        message: (err as Error).message || 'An error occurred',
      });
    } finally {
      setLoadingJob(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">
          Manual Jobs & Tasks
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Manually trigger background tasks and content generation routines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Contest Job */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Generate Daily AI Contest</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              Creates a daily contest using AI focused on Indian competitive exams. Automatically broadcasts push notifications to all students.
            </p>
          </div>
          
          <Button
            onClick={() => runJob('daily_contest', '/api/cron/generate-daily-contest')}
            disabled={loadingJob !== null}
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            {loadingJob === 'daily_contest' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Task Now
          </Button>
          
          {result?.job === 'daily_contest' && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${result.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}
        </div>

        {/* UP PET Course Job */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Generate UP PET Course Chapter</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              Generates the next syllabus chapter for the UPSSSC PET 2026 AI course and attaches a practice quiz.
            </p>
          </div>
          
          <Button
            onClick={() => runJob('up_pet_course', '/api/cron/generate-up-pet-course')}
            disabled={loadingJob !== null}
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            {loadingJob === 'up_pet_course' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Task Now
          </Button>

          {result?.job === 'up_pet_course' && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${result.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}
        </div>
        {/* Declare Results Job */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Declare Contest Results</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              Manually triggers the result declaration for all completed contests and sends notifications to participants.
            </p>
          </div>
          
          <Button
            onClick={() => runJob('declare_results', '/api/cron/declare-results')}
            disabled={loadingJob !== null}
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            {loadingJob === 'declare_results' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Task Now
          </Button>

          {result?.job === 'declare_results' && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${result.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
