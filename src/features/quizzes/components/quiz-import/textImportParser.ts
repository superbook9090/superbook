import { parseRawTextQuestions } from '../../utils/rawTextQuizParser';
import type { ExcelRow } from '../types';

export interface TextParseResult {
  data: ExcelRow[];
  error: string;
}

export function parsePastedQuizText(
  importText: string,
  t: (key: string) => string
): TextParseResult {
  const trimmed = importText.trim();
  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { data: [], error: t('createQuizForm.fileEmpty') };
  }

  // Check whether user pasted pipe-delimited text or raw question text
  const hasPipes = lines.some((l) => l.split('|').length >= 5);

  if (!hasPipes) {
    const rawResult = parseRawTextQuestions(trimmed);
    if (rawResult.questions.length > 0) {
      return {
        data: rawResult.questions,
        error: rawResult.errors.length > 0 ? rawResult.errors.join('\n') : '',
      };
    }
    if (rawResult.errors.length > 0) {
      return { data: [], error: rawResult.errors.join('\n') };
    }
  }

  // Process pipe-delimited format
  const firstLineCols = lines[0].split('|').map((h) => h.trim().toLowerCase());
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
    const row = lines[i].split('|').map((cell) => cell.trim());
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
      correctIndex = parseInt(ca, 10) - 1;
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

  // If pipe parsing found nothing but user typed something, attempt raw parsing fallback
  if (parsed.length === 0) {
    const fallbackRaw = parseRawTextQuestions(trimmed);
    if (fallbackRaw.questions.length > 0) {
      return { data: fallbackRaw.questions, error: '' };
    }
  }

  let errorMsg = '';
  if (errors.length > 0) {
    errorMsg = `${t('createQuizForm.validationErrors')}\n${errors.slice(0, 5).join('\n')}${
      errors.length > 5 ? `\n${t('createQuizForm.andMoreErrors').replace('{count}', (errors.length - 5).toString())}` : ''
    }`;
  }

  if (parsed.length === 0 && !errorMsg) {
    errorMsg = t('createQuizForm.noValidQuestions');
  }

  return { data: parsed, error: errorMsg };
}
