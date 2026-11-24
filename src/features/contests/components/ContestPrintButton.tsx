'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import type { ContestQuestionReview } from '@/lib/api/contests';

interface ContestPrintButtonProps {
  contestTitle?: string;
  questionReviews: ContestQuestionReview[];
  userScore?: number;
  userRank?: number | null;
  className?: string;
}

export function ContestPrintButton({
  contestTitle = 'Contest Examination',
  questionReviews,
  userScore,
  userRank,
  className = '',
}: ContestPrintButtonProps) {
  if (!questionReviews || questionReviews.length === 0) return null;

  const handlePrint = () => {
    // Open a dedicated printable window with clean CSS
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${contestTitle} - Question Paper & Answer Key</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #111; margin: 0; padding: 20px; }
          .header { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 20px; text-align: center; }
          .logo { font-size: 18pt; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #4338ca; }
          .subtitle { font-size: 13pt; font-weight: 700; margin-top: 4px; }
          .meta { font-size: 9pt; color: #555; margin-top: 6px; }
          .scorecard { display: flex; justify-content: space-around; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; margin-bottom: 20px; font-size: 10pt; font-weight: 600; }
          .q-block { break-inside: avoid; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px dashed #d1d5db; }
          .q-title { font-weight: 700; margin-bottom: 6px; }
          .options { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin: 8px 0 10px 14px; font-size: 10pt; }
          .opt { padding: 2px 0; }
          .opt-correct { font-weight: 700; color: #15803d; }
          .solution-box { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 6px 10px; margin-top: 6px; font-size: 9.5pt; color: #334155; }
          .footer { text-align: center; font-size: 8pt; color: #888; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Quiz-Do</div>
          <div class="subtitle">${contestTitle}</div>
          <div class="meta">Official Question Paper with Verified Answer Key & Explanations • Total Questions: ${questionReviews.length}</div>
        </div>

        ${
          userScore !== undefined
            ? `
          <div class="scorecard">
            <div>Score: <strong>${userScore} pts</strong></div>
            ${userRank ? `<div>All-India Rank: <strong>#${userRank}</strong></div>` : ''}
            <div>Questions: <strong>${questionReviews.length}</strong></div>
            <div>Generated from: <strong>quiz-do.com</strong></div>
          </div>
        `
            : ''
        }

        <div class="questions">
          ${questionReviews
            .map((q, idx) => {
              const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
              return `
                <div class="q-block">
                  <div class="q-title">Q${idx + 1}. ${q.prompt}</div>
                  <div class="options">
                    ${(q.options || [])
                      .map(
                        (opt, oIdx) => `
                      <div class="opt ${oIdx === q.correctOption ? 'opt-correct' : ''}">
                        (${optionLetters[oIdx]}) ${opt} ${oIdx === q.correctOption ? '✓ (Correct)' : ''}
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                  <div class="solution-box">
                    <strong>Correct Answer:</strong> Option (${optionLetters[q.correctOption] || 'A'})<br/>
                    ${q.explanation ? `<strong>Explanation:</strong> ${q.explanation}` : ''}
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>

        <div class="footer">
          Printed from Quiz-Do Learning Arena • Practice online at https://quiz-do.com
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all shadow-xs ${className}`}
      title="Download or Print PDF Question Paper with Solutions"
      aria-label="Download or Print PDF Question Paper"
    >
      <Printer className="w-3.5 h-3.5 text-[var(--color-primary)]" />
      <span>Print / PDF Paper</span>
    </button>
  );
}

export default ContestPrintButton;
