'use client';

import React from 'react';
import { BookOpen, CheckCircle2, Info, Table2 } from 'lucide-react';
import { getSeoToolGuide } from '@/data/seo-guides';
import { PublicInteractiveQuiz } from './PublicInteractiveQuiz';
import { PublicMcqSandbox } from './PublicMcqSandbox';

interface SeoToolGuideSectionProps {
  toolSlug: string;
}

export function SeoToolGuideSection({ toolSlug }: SeoToolGuideSectionProps) {
  const guide = getSeoToolGuide(toolSlug);

  return (
    <div className="space-y-12">
      {/* Live No-Login Interactive Experience */}
      {guide.interactiveMode === 'quiz' ? (
        <PublicInteractiveQuiz
          title={guide.interactiveTitle}
          subtitle={guide.interactiveSubtitle}
          questions={guide.sampleQuestions}
        />
      ) : (
        <PublicMcqSandbox
          title={guide.interactiveTitle}
          subtitle={guide.interactiveSubtitle}
          initialQuestions={guide.sampleQuestions}
        />
      )}

      {/* GEO Direct-Answer Summary & Key Facts */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card-solid)] p-6 sm:p-8 shadow-[var(--shadow-sm)] space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
            <Info className="w-5 h-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-foreground)]">
              {guide.quickAnswerHeading}
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] leading-relaxed mt-2">
              {guide.quickAnswer}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {guide.keyFacts.map((fact) => (
            <div
              key={fact.label}
              className="p-4 rounded-2xl bg-[var(--surface-muted)]/60 border border-[var(--border)]"
            >
              <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {fact.label}
              </dt>
              <dd className="text-sm font-bold text-[var(--color-foreground)] mt-1">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Structured Blueprint / Comparison Table (SEO & GEO Citation Asset) */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card-solid)] p-6 sm:p-8 shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex items-center gap-2.5">
          <Table2 className="w-5 h-5 text-[var(--primary)] shrink-0" aria-hidden />
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-foreground)]">
              {guide.table.heading}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              {guide.table.caption}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="min-w-full divide-y divide-[var(--border)] text-left text-xs sm:text-sm">
            <caption className="sr-only">{guide.table.caption}</caption>
            <thead className="bg-[var(--surface-muted)]/75">
              <tr>
                {guide.table.headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-3 font-bold text-[var(--color-foreground)] whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/70">
              {guide.table.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[var(--surface-muted)]/35 transition-colors">
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className={`px-4 py-3 ${
                        cellIdx === 0
                          ? 'font-semibold text-[var(--color-foreground)]'
                          : 'text-[var(--color-muted-foreground)]'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Editorial Deep-Dive Playbook */}
      <article className="rounded-3xl border border-[var(--border)] bg-[var(--card-solid)] p-6 sm:p-8 shadow-[var(--shadow-sm)] space-y-8">
        {guide.sections.map((section) => (
          <div key={section.heading} className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-foreground)] flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[var(--teacher-primary)] shrink-0" aria-hidden />
              <span>{section.heading}</span>
            </h2>
            {section.paragraphs.map((para, pIdx) => (
              <p
                key={pIdx}
                className="text-sm sm:text-base text-[var(--color-muted-foreground)] leading-relaxed"
              >
                {para}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-2.5 pt-2">
                {section.bullets.map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    className="flex items-start gap-2.5 text-sm text-[var(--color-foreground)]"
                  >
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </article>
    </div>
  );
}
