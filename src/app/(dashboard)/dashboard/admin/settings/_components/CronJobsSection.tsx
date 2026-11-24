import React, { useState } from 'react';
import { Play, Loader2, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import InactiveCoursesCleanupModal from '@/components/admin/InactiveCoursesCleanupModal';
import InactiveQuizzesCleanupModal from '@/components/admin/InactiveQuizzesCleanupModal';

export function CronJobsSection() {
  const [loadingJob, setLoadingJob] = useState<string | null>(null);
  const [bankPoProgress, setBankPoProgress] = useState<string | null>(null);
  const [result, setResult] = useState<{ job: string; success: boolean; message: string } | null>(null);
  const [showInactiveCleanupModal, setShowInactiveCleanupModal] = useState(false);
  const [showInactiveQuizzesModal, setShowInactiveQuizzesModal] = useState(false);

  const runJob = async (jobId: string, endpoint: string, options?: RequestInit) => {
    setLoadingJob(jobId);
    setResult(null);
    try {
      const res = await fetch(endpoint, {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        body: options?.body,
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
   * Generates a batch of 10-12 lessons across Bank PO syllabus chapters in one click,
   * dispatching independent parallel API requests with a worker pool of 3
   * to guarantee zero serverless timeouts and avoid AI burst rate limits.
   */
  const runBankPoChapter = async () => {
    setLoadingJob('bank_po_course');
    setResult(null);
    setBankPoProgress('Analyzing Bank PO course roadmap for next 10-12 lessons batch...');

    try {
      // 1. Fetch next batch plan (up to 12 lessons)
      const planRes = await fetch('/api/cron/generate-bank-po-course?action=plan&limit=12');
      const plan = await planRes.json().catch(() => ({}));

      if (!planRes.ok || !plan.success) {
        setResult({
          job: 'bank_po_course',
          success: false,
          message: plan.message || 'Failed to determine syllabus roadmap plan.',
        });
        return;
      }

      if (plan.isCourseCompleted) {
        setResult({
          job: 'bank_po_course',
          success: true,
          message: 'All chapters of the Bank PO 2026 course are already 100% generated!',
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
          job: 'bank_po_course',
          success: true,
          message: 'No pending lessons found. The Bank PO course is up to date!',
        });
        return;
      }

      const total = pending.length;
      let completed = 0;
      let failed = 0;

      setBankPoProgress(
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
              `/api/cron/generate-bank-po-course?chapterIndex=${item.chapterIndex}&lessonIndex=${item.lessonIndex}`
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

          setBankPoProgress(
            `Generating Bank PO Course: (${completed}/${total} completed${failed > 0 ? `, ${failed} failed` : ''}) — current: "${item.title.slice(0, 28)}..."`
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
        job: 'bank_po_course',
        success: completed > 0,
        message:
          completed === total
            ? `Successfully generated all ${completed} lessons and quizzes${chaptersSummary} in this batch!`
            : `Generated ${completed}/${total} lessons${chaptersSummary}.${failed > 0 ? ` (${failed} failed)` : ''}`,
      });
    } catch (err) {
      setResult({
        job: 'bank_po_course',
        success: false,
        message: (err as Error).message || 'An error occurred during Bank PO course generation',
      });
    } finally {
      setBankPoProgress(null);
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
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Generate Daily Mixed GK & GS AI Contest</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              Creates a daily Mixed GK & GS (History, Polity, Geography, Economy, Science) competition with medium-level hardness. Automatically sets up live leaderboard & push notifications.
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
            {loadingJob === 'daily_contest' ? 'Generating Mixed Contest...' : 'Run Task Now'}
          </Button>

          {loadingJob === 'daily_contest' && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Generating balanced Mixed GK & GS questions & configuring arena...</span>
            </div>
          )}
          
          {result?.job === 'daily_contest' && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${result.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}
        </div>


        {/* Bank PO 2026 Course Job */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Generate Bank PO 2026 Course (10-12 Lessons Batch)</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              Generates a batch of 10–12 Bank PO syllabus lessons with in-depth study notes & practice quizzes across Aptitude, Reasoning, English, and Banking Awareness.
            </p>
          </div>
          
          <Button
            onClick={runBankPoChapter}
            disabled={loadingJob !== null}
            variant="secondary"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            {loadingJob === 'bank_po_course' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Task Now
          </Button>

          {loadingJob === 'bank_po_course' && bankPoProgress && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{bankPoProgress}</span>
            </div>
          )}

          {result?.job === 'bank_po_course' && (
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

        {/* Generate AI Trending Blog Job (2000+ Words for SEO & AdSense) */}
        <div className="p-5 rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20">
                SEO & Google AdSense Publisher
              </div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)]">
                Generate 2,000+ Word Trending AI Blog (Superadmin Only)
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
                Uses AI to write an exhaustive, deep-dive academic article (minimum 2,000–2,500 words) on trending topics with semantic HTML tables, FAQs, and E-E-A-T structure to maximize site SEO and Google AdSense revenue.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={() => runJob('ai_trending_blog_en', '/api/admin/blogs/generate-ai-trending', { method: 'POST', body: JSON.stringify({ language: 'en' }) })}
              disabled={loadingJob !== null}
              variant="primary"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2 font-bold min-h-[42px]"
            >
              {loadingJob === 'ai_trending_blog_en' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loadingJob === 'ai_trending_blog_en' ? 'Writing 2000+ Word English Blog (approx. 40s)...' : 'Generate English AI Blog (2000+ Words)'}
            </Button>

            <Button
              onClick={() => runJob('ai_trending_blog_hi', '/api/admin/blogs/generate-ai-trending', { method: 'POST', body: JSON.stringify({ language: 'hi' }) })}
              disabled={loadingJob !== null}
              variant="secondary"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2 font-bold min-h-[42px]"
            >
              {loadingJob === 'ai_trending_blog_hi' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loadingJob === 'ai_trending_blog_hi' ? 'Writing 2000+ Word Hindi Blog (approx. 40s)...' : 'Generate Hindi AI Blog (2000+ Words)'}
            </Button>
          </div>

          {(loadingJob === 'ai_trending_blog_en' || loadingJob === 'ai_trending_blog_hi') && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>
                Consulting AI models, structuring 2,000+ words with tables and FAQs, and publishing as Superadmin author...
              </span>
            </div>
          )}

          {(result?.job === 'ai_trending_blog_en' || result?.job === 'ai_trending_blog_hi') && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${result.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="font-medium">{result.message}</span>
            </div>
          )}
        </div>

        {/* Clean Up Inactive Courses Job (10+ Days Old, 0 Student Enrollments) */}
        <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-4 md:col-span-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-500 border border-red-500/20">
              Superadmin Maintenance Script
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)]">
              Delete Inactive Courses (&gt; 10 Days Old &amp; 0 Enrollments)
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
              Scans for courses created more than 10 days ago with 0 verified student enrollments, lets you preview and confirm the exact list, deletes all selected courses &amp; related data, and sends the standard removal notice email to each instructor.
            </p>
          </div>

          <Button
            onClick={() => setShowInactiveCleanupModal(true)}
            disabled={loadingJob !== null}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-red-500/40 text-red-500 hover:bg-red-500/10 font-bold min-h-[42px] px-5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Preview &amp; Clean Up Inactive Courses</span>
          </Button>

          {result?.job === 'inactive_courses_cleanup' && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${result.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="font-medium">{result.message}</span>
            </div>
          )}
        </div>

        {/* Clean Up Inactive Quizzes Job (10+ Days Old, 0 Attempts, No Email) */}
        <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-4 md:col-span-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-500 border border-red-500/20">
              Superadmin Maintenance Script
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)]">
              Delete Inactive Quizzes (&gt; 10 Days Old &amp; 0 Attempts)
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
              Scans for quizzes created more than 10 days ago with 0 verified student attempts (automatically excluding any quizzes linked to contests or viral challenges), lets you preview and confirm the list, and deletes all selected quizzes &amp; questions silently without sending emails.
            </p>
          </div>

          <Button
            onClick={() => setShowInactiveQuizzesModal(true)}
            disabled={loadingJob !== null}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-red-500/40 text-red-500 hover:bg-red-500/10 font-bold min-h-[42px] px-5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Preview &amp; Clean Up Inactive Quizzes</span>
          </Button>

          {result?.job === 'inactive_quizzes_cleanup' && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${result.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="font-medium">{result.message}</span>
            </div>
          )}
        </div>
      </div>

      <InactiveCoursesCleanupModal
        isOpen={showInactiveCleanupModal}
        onClose={() => setShowInactiveCleanupModal(false)}
        onCompleted={(message) =>
          setResult({ job: 'inactive_courses_cleanup', success: true, message })
        }
      />

      <InactiveQuizzesCleanupModal
        isOpen={showInactiveQuizzesModal}
        onClose={() => setShowInactiveQuizzesModal(false)}
        onCompleted={(message) =>
          setResult({ job: 'inactive_quizzes_cleanup', success: true, message })
        }
      />
    </div>
  );
}
