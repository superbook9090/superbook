import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AiQuizGeneratorModal } from './AiQuizGeneratorModal';
import type { Question, ExcelRow } from './types';

type Props = {
  theme: { gradient: string; activeBg: string; activeText: string };
  onImport: (questions: Question[]) => void;
};

export function QuizImportTool({ theme, onImport }: Props) {
  const { t } = useTranslation();
  const enableAiQuizGen = useSettingsStore(
    (s) => s.settings.featureToggles.enableAiQuizGen ?? true
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportHelp, setShowImportHelp] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const [showTextImport, setShowTextImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showTextImportHelp, setShowTextImportHelp] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const resetFileInput = () => {
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv') && !file.name.endsWith('.xls')) {
      setUploadError(t('createQuizForm.validFileRequired'));
      resetFileInput();
      return;
    }

    setIsParsing(true);
    setUploadError('');
    setPreviewData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

      if (jsonData.length < 2) {
        setUploadError(t('createQuizForm.fileEmpty'));
        setIsParsing(false);
        return;
      }

      const headers = jsonData[0].map((h) => h.toString().toLowerCase().trim());
      const requiredColumns = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer'];
      const hasAllColumns = requiredColumns.every((col) =>
        headers.some((h) => h === col || h === col.replace('option', 'option_'))
      );

      if (!hasAllColumns) {
        setUploadError(t('createQuizForm.invalidFormat').replace('{columns}', headers.join(', ')));
        setIsParsing(false);
        return;
      }

      const getColIndex = (names: string[]) => {
        for (const name of names) {
          const idx = headers.findIndex((h) => h === name.toLowerCase());
          if (idx !== -1) return idx;
        }
        return -1;
      };

      const colMap = {
        question: getColIndex(['question']),
        optionA: getColIndex(['optiona', 'option_a']),
        optionB: getColIndex(['optionb', 'option_b']),
        optionC: getColIndex(['optionc', 'option_c']),
        optionD: getColIndex(['optiond', 'option_d']),
        correctAnswer: getColIndex(['correctanswer', 'correct_answer']),
      };

      const parsed: ExcelRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row.every((cell) => !cell)) continue;

        const question = row[colMap.question]?.toString().trim();
        const optionA = row[colMap.optionA]?.toString().trim();
        const optionB = row[colMap.optionB]?.toString().trim();
        const optionC = row[colMap.optionC]?.toString().trim();
        const optionD = row[colMap.optionD]?.toString().trim();
        const correctAnswer = row[colMap.correctAnswer];

        if (!question) {
          errors.push(t('createQuizForm.questionRequired').replace('{number}', (i + 1).toString()));
          continue;
        }
        if (!optionA || !optionB || !optionC || !optionD) {
          errors.push(t('createQuizForm.optionsRequired').replace('{number}', (i + 1).toString()));
          continue;
        }
        if (correctAnswer === undefined || correctAnswer === null || correctAnswer === '') {
          errors.push(t('createQuizForm.correctAnswerRequired'));
          continue;
        }

        let correctIndex: number;
        const ca = correctAnswer.toString().trim().toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(ca)) {
          correctIndex = ca.charCodeAt(0) - 65;
        } else {
          correctIndex = parseInt(ca) - 1;
        }

        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
          errors.push(t('createQuizForm.correctAnswerInvalid'));
          continue;
        }

        parsed.push({
          question,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer: correctIndex,
        });
      }

      if (errors.length > 0) {
        setUploadError(`${t('createQuizForm.validationErrors')}\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n${t('createQuizForm.andMoreErrors').replace('{count}', (errors.length - 5).toString())}` : ''}`);
      }

      if (parsed.length === 0) {
        setUploadError((prev) => prev || t('createQuizForm.noValidQuestions'));
      } else {
        setPreviewData(parsed);
      }
    } catch {
      setUploadError(t('createQuizForm.parsingError'));
    } finally {
      setIsParsing(false);
      resetFileInput();
    }
  }, [t]);

  const handleTextImport = useCallback(() => {
    if (!importText.trim()) return;
    setIsParsing(true);
    setUploadError('');
    setPreviewData([]);

    try {
      const lines = importText.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length === 0) {
        setUploadError(t('createQuizForm.fileEmpty'));
        setIsParsing(false);
        return;
      }

      const firstLineCols = lines[0].split('|').map(h => h.trim().toLowerCase());
      const requiredColumns = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer'];
      const isHeader = requiredColumns.every((col) =>
        firstLineCols.some((h) => h === col || h === col.replace('option', 'option_'))
      );

      let startIndex = 0;
      let colMap = {
        question: 0,
        optionA: 1,
        optionB: 2,
        optionC: 3,
        optionD: 4,
        correctAnswer: 5,
      };

      if (isHeader) {
        startIndex = 1;
        const getColIndex = (names: string[]) => {
          for (const name of names) {
            const idx = firstLineCols.findIndex((h) => h === name.toLowerCase());
            if (idx !== -1) return idx;
          }
          return -1;
        };

        colMap = {
          question: getColIndex(['question']),
          optionA: getColIndex(['optiona', 'option_a']),
          optionB: getColIndex(['optionb', 'option_b']),
          optionC: getColIndex(['optionc', 'option_c']),
          optionD: getColIndex(['optiond', 'option_d']),
          correctAnswer: getColIndex(['correctanswer', 'correct_answer']),
        };
      }

      const parsed: ExcelRow[] = [];
      const errors: string[] = [];

      for (let i = startIndex; i < lines.length; i++) {
        const row = lines[i].split('|').map(cell => cell.trim());
        if (row.every((cell) => !cell)) continue;

        const question = row[colMap.question];
        const optionA = row[colMap.optionA];
        const optionB = row[colMap.optionB];
        const optionC = row[colMap.optionC];
        const optionD = row[colMap.optionD];
        const correctAnswer = row[colMap.correctAnswer];

        if (!question) {
          errors.push(t('createQuizForm.questionRequired').replace('{number}', (i + 1).toString()));
          continue;
        }
        if (!optionA || !optionB || !optionC || !optionD) {
          errors.push(t('createQuizForm.optionsRequired').replace('{number}', (i + 1).toString()));
          continue;
        }
        if (correctAnswer === undefined || correctAnswer === null || correctAnswer === '') {
          errors.push(t('createQuizForm.correctAnswerRequired'));
          continue;
        }

        let correctIndex: number;
        const ca = correctAnswer.toString().toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(ca)) {
          correctIndex = ca.charCodeAt(0) - 65;
        } else {
          correctIndex = parseInt(ca) - 1;
        }

        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
          errors.push(t('createQuizForm.correctAnswerInvalid'));
          continue;
        }

        parsed.push({
          question,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer: correctIndex,
        });
      }

      if (errors.length > 0) {
        setUploadError(`${t('createQuizForm.validationErrors')}\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n${t('createQuizForm.andMoreErrors').replace('{count}', (errors.length - 5).toString())}` : ''}`);
      }

      if (parsed.length === 0) {
        setUploadError((prev) => prev || t('createQuizForm.noValidQuestions'));
      } else {
        setPreviewData(parsed);
        setShowTextImport(false);
        setImportText('');
      }
    } catch {
      setUploadError(t('createQuizForm.parsingError'));
    } finally {
      setIsParsing(false);
    }
  }, [importText, t]);

  const handleConfirmImport = useCallback(() => {
    const importedQuestions: Question[] = previewData.map((row) => ({
      question: row.question,
      options: [row.optionA, row.optionB, row.optionC, row.optionD],
      correctAnswer: row.correctAnswer,
    }));

    onImport(importedQuestions);
    setPreviewData([]);
    setUploadError('');
  }, [previewData, onImport]);

  const handleCancelImport = useCallback(() => {
    setPreviewData([]);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const triggerFileImport = useCallback(() => {
    if (isParsing) return;
    setUploadError('');
    fileInputRef.current?.click();
  }, [isParsing]);

  const downloadTemplate = useCallback(() => {
    const template = [
      ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'],
      ['What is 2+2?', '3', '4', '5', '6', 'B'],
      ['What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C'],
      ['Which planet is closest to the Sun?', 'Venus', 'Earth', 'Mercury', 'Mars', 'C'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');
    XLSX.writeFile(wb, 'quiz_template.xlsx');
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="sr-only"
        tabIndex={-1}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {enableAiQuizGen && (
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity shadow-sm`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>{t('createQuizForm.generateAi') || 'Generate with AI'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={triggerFileImport}
          disabled={isParsing}
          className="inline-flex flex-1 sm:flex-none items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isParsing ? t('createQuizForm.parsingFile') : t('createQuizForm.importFile')}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowImportHelp((open) => !open);
            setShowTextImport(false);
          }}
          aria-expanded={showImportHelp}
          className="inline-flex flex-1 sm:flex-none items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg border-2 border-[var(--color-border)] text-[var(--color-foreground)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-accent)] transition-colors"
        >
          {t('createQuizForm.howToUseImport')}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowTextImport((open) => !open);
            setShowImportHelp(false);
          }}
          aria-expanded={showTextImport}
          className="inline-flex flex-1 sm:flex-none sm:ml-auto items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] transition-colors"
        >
          {t('createQuizForm.pasteText')}
        </button>
      </div>

      <AiQuizGeneratorModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSuccess={(imported) => onImport(imported)}
        theme={theme}
      />

      <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-4">{t('createQuizForm.questions')}</h3>

      {showTextImport && (
        <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-accent)]">
            <h4 className="font-medium text-[var(--color-foreground)]">{t('createQuizForm.pasteText')}</h4>
            <div className="flex shrink-0 gap-2 items-center">
              <button
                type="button"
                onClick={() => setShowTextImportHelp((open) => !open)}
                className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80 px-2 py-1"
              >
                {t('createQuizForm.howToUseTextImport')}
              </button>
              <button
                type="button"
                onClick={() => setShowTextImport(false)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] text-lg leading-none px-1"
                aria-label={t('createQuizForm.closeHelp')}
              >
                ×
              </button>
            </div>
          </div>
          {showTextImportHelp && (
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <p className="text-sm text-[var(--color-muted-foreground)] whitespace-pre-wrap">
                {t('createQuizForm.textImportInstructions')}
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
                {t('createQuizForm.importHelpCorrectAnswer')}
              </p>
            </div>
          )}
          <div className="p-4">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={t('createQuizForm.pasteTextPlaceholder')}
              className="w-full h-40 p-3 text-sm rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-foreground)] font-mono resize-y"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleTextImport}
                disabled={isParsing || !importText.trim()}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isParsing ? t('createQuizForm.parsingFile') : t('createQuizForm.parseText')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportHelp && (
        <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-accent)]">
            <h4 className="font-medium text-[var(--color-foreground)]">{t('createQuizForm.howToUseImport')}</h4>
            <button
              type="button"
              onClick={() => setShowImportHelp(false)}
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] text-lg leading-none px-1"
              aria-label={t('createQuizForm.closeHelp')}
            >
              ×
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {t('createQuizForm.importQuestionsFromExcel')}
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                {t('createQuizForm.importInstructions')}
              </p>
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('createQuizForm.importHelpFormats')}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('createQuizForm.importHelpCorrectAnswer')}</p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center justify-center min-h-[36px] px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-primary)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] transition-colors"
            >
              {t('createQuizForm.downloadTemplate')}
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mb-4 bg-[var(--color-error-light)] border border-[var(--color-error)]/30 rounded-md p-3">
          <p className="text-sm text-[var(--color-error)] whitespace-pre-line">{uploadError}</p>
        </div>
      )}

      {previewData.length > 0 && (
        <div className="mb-6 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div className={`px-4 py-3 ${theme.activeBg} border-b border-[var(--color-border)]`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h4 className={`font-medium ${theme.activeText}`}>
                {t('createQuizForm.preview')}: {previewData.length} {t('createQuizForm.questionsFound')}
              </h4>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handleCancelImport}
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] px-3 py-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-accent)]"
                >
                  {t('createQuizForm.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className={`text-sm text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 px-3 py-1.5 rounded`}
                >
                  {t('createQuizForm.confirmImport')}
                </button>
              </div>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-accent)] sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.question')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.options')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.answer')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {previewData.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-sm text-[var(--color-foreground)]">{idx + 1}</td>
                    <td className="px-3 py-2 text-sm text-[var(--color-foreground)] max-w-xs truncate">{row.question}</td>
                    <td className="px-3 py-2 text-sm text-[var(--color-muted-foreground)]">A, B, C, D</td>
                    <td className="px-3 py-2 text-sm font-medium text-[var(--color-success)]">
                      {['A', 'B', 'C', 'D'][typeof row.correctAnswer === 'number' ? row.correctAnswer : 0]}
                    </td>
                  </tr>
                ))}
                {previewData.length > 5 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-sm text-[var(--color-muted-foreground)] text-center italic">
                      ... {t('createQuizForm.moreQuestions').replace('{count}', (previewData.length - 5).toString())}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
