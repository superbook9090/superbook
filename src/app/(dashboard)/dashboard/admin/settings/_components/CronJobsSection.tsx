import React, { useState } from 'react';
import { Play, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export function CronJobsSection() {
  const [loadingJob, setLoadingJob] = useState<string | null>(null);
  const [upPetProgress, setUpPetProgress] = useState<string | null>(null);
  const [result, setResult] = useState<{ job: string; success: boolean; message: string } | null>(null);

  const runJob = async (jobId: string, endpoint: string) => {
    setLoadingJob(jobId);
    setResult(null);
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          message:
            res.status === 504
              ? 'Server execution timed out (HTTP 504). Checkpoint may have been saved.'
              : `Server returned HTTP ${res.status}: ${res.statusText || 'Error processing request'}`,
        };
      }
      setResult({
        job: jobId,
        success: res.ok && data.success !== false,
        message: String(data.message || (res.ok ? 'Job executed successfully' : 'Job failed')),
      });
    } catch (err) {
      setResult({
        job: jobId,
        success: false,
        message: (err as Error).message || 'An error occurred while running the task',
      });
    } finally {
      setLoadingJob(null);
    }
  };

  /**
   * Generates a batch of 10-12 lessons across syllabus chapters in one click,
   * dispatching independent parallel API requests with a worker pool of 3
   * to guarantee zero serverless timeouts and avoid AI burst rate limits.
   */
  const runUpPetChapter = async () => {
    setLoadingJob('up_pet_course');
    setResult(null);
    setUpPetProgress('Analyzing course roadmap for next 10-12 lessons batch...');

    try {
      // 1. Fetch next batch plan (up to 12 lessons)
      const planRes = await fetch('/api/cron/generate-up-pet-course?action=plan&limit=12');
      const plan = await planRes.json().catch(() => ({}));

      if (!planRes.ok || !plan.success) {
        setResult({
          job: 'up_pet_course',
          success: false,
          message: plan.message || 'Failed to determine syllabus roadmap plan.',
        });
        return;
      }

      if (plan.isCourseCompleted) {
        setResult({
          job: 'up_pet_course',
          success: true,
          message: 'All chapters of the UPSSSC PET course are already 100% generated!',
        });
        return;
      }

      const pending: Array<{
        chapterIndex: number;
        lessonIndex: number;
        title: string;
        chapterTitle: string;
      }> = plan.pendingLessons || [];

      if (pending.length === 0) {
        setResult({
          job: 'up_pet_course',
          success: true,
          message: 'No pending lessons found. The course is up to date!',
        });
        return;
      }

      const total = pending.length;
      let completed = 0;
      let failed = 0;

      setUpPetProgress(
        `Starting generation batch of ${total} lessons across ${plan.chaptersCount || 1} chapter(s)... (0/${total} completed)`
      );

      // 2. Concurrency worker pool (3 workers running independently)
      const concurrency = 3;
      let nextIndex = 0;

      const worker = async () => {
        while (nextIndex < pending.length) {
          const idx = nextIndex++;
          const item = pending[idx];

          try {
            const res = await fetch(
              `/api/cron/generate-up-pet-course?chapterIndex=${item.chapterIndex}&lessonIndex=${item.lessonIndex}`
            );
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
              completed++;
            } else {
              failed++;
            }
          } catch {
            failed++;
          }

          setUpPetProgress(
            `Generating UP PET Course: (${completed}/${total} completed${failed > 0 ? `, ${failed} failed` : ''}) — current: "${item.title.slice(0, 28)}..."`
          );
        }
      };

      const workers = Array.from(
        { length: Math.min(concurrency, total) },
        () => worker()
      );
      await Promise.all(workers);

      const chaptersSummary = Array.isArray(plan.chaptersCovered) && plan.chaptersCovered.length > 0
        ? ` (${plan.chaptersCovered.slice(0, 2).join(', ')}${plan.chaptersCovered.length > 2 ? ` +${plan.chaptersCovered.length - 2} more` : ''})`
        : '';

      setResult({
        job: 'up_pet_course',
        success: completed > 0,
        message:
          completed === total
            ? `Successfully generated all ${completed} lessons and quizzes${chaptersSummary} in this batch!`
            : `Generated ${completed}/${total} lessons${chaptersSummary}.${failed > 0 ? ` (${failed} failed)` : ''}`,
      });
    } catch (err) {
      setResult({
        job: 'up_pet_course',
        success: false,
        message: (err as Error).message || 'An error occurred during course generation',
      });
    } finally {
      setUpPetProgress(null);
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
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Generate UP PET Course (10-12 Lessons Batch)</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              Generates a batch of 10–12 syllabus lessons with comprehensive notes & practice quizzes across chapters via independent parallel tasks to avoid server timeouts.
            </p>
          </div>
          
          <Button
            onClick={runUpPetChapter}
            disabled={loadingJob !== null}
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            {loadingJob === 'up_pet_course' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Task Now
          </Button>

          {loadingJob === 'up_pet_course' && upPetProgress && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{upPetProgress}</span>
            </div>
          )}

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
