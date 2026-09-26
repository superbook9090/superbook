'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AiQuizGeneratorModal } from './AiQuizGeneratorModal';
import type { Question, ExcelRow } from './types';
import { parseExcelQuizFile } from './quiz-import/fileImportParser';
import { parsePastedQuizText } from './quiz-import/textImportParser';
import { downloadQuizTemplate } from './quiz-import/templateUtils';
import { ImportPreviewTable } from './quiz-import/ImportPreviewTable';
import { TextImportDrawer } from './quiz-import/TextImportDrawer';
import { FileImportHelpDrawer } from './quiz-import/FileImportHelpDrawer';

type Props = {
  theme: { gradient: string; activeBg: string; activeText: string };
  onImport: (questions: Question[]) => void;
  entityType?: 'quiz' | 'contest';
  triggerAiModalOpen?: number;
};

export function QuizImportTool({ theme, onImport, entityType = 'quiz', triggerAiModalOpen = 0 }: Props) {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const enableAiQuizGen = useSettingsStore(
    (s) => s.settings.featureToggles.enableAiQuizGen ?? true
  );
  const canUseAi =
    enableAiQuizGen &&
    (session?.user?.role === 'superadmin' ||
      session?.user?.role === 'admin' ||
      Boolean(session?.user?.canGenerateAiQuizzes) ||
      (entityType === 'contest' && Boolean(session?.user?.canCreateContests)));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportHelp, setShowImportHelp] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const [showTextImport, setShowTextImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    if (triggerAiModalOpen > 0) {
      setShowAiModal(true);
    }
  }, [triggerAiModalOpen]);

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
      const result = await parseExcelQuizFile(file, t);
      if (result.error) {
        setUploadError(result.error);
      }
      setPreviewData(result.data);
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
      const result = parsePastedQuizText(importText, t);
      if (result.error) {
        setUploadError(result.error);
      }
      if (result.data.length > 0) {
        setPreviewData(result.data);
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
      ...(row.explanation ? { explanation: row.explanation } : {}),
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
        {canUseAi && (
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity shadow-sm`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>
              {entityType === 'contest'
                ? t('contest.generateAiQuestions')
                : t('createQuizForm.generateAi')}
            </span>
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
        entityType={entityType}
      />

      <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-4">{t('createQuizForm.questions')}</h3>

      <TextImportDrawer
        isOpen={showTextImport}
        onClose={() => setShowTextImport(false)}
        importText={importText}
        setImportText={setImportText}
        onParse={handleTextImport}
        isParsing={isParsing}
      />

      <FileImportHelpDrawer
        isOpen={showImportHelp}
        onClose={() => setShowImportHelp(false)}
        onDownloadTemplate={downloadQuizTemplate}
      />

      {uploadError && (
        <div className="mb-4 bg-[var(--color-error-light)] border border-[var(--color-error)]/30 rounded-md p-3">
          <p className="text-sm text-[var(--color-error)] whitespace-pre-line">{uploadError}</p>
        </div>
      )}

      <ImportPreviewTable
        previewData={previewData}
        theme={theme}
        onCancel={handleCancelImport}
        onConfirm={handleConfirmImport}
      />
    </>
  );
}
