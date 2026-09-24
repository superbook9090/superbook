import type { ExcelRow } from '../types';

export interface FileParseResult {
  data: ExcelRow[];
  error: string;
}

export async function parseExcelQuizFile(
  file: File,
  t: (key: string) => string
): Promise<FileParseResult> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

  if (jsonData.length < 2) {
    return { data: [], error: t('createQuizForm.fileEmpty') };
  }

  const headers = jsonData[0].map((h) => h.toString().toLowerCase().trim());
  const requiredColumns = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer'];
  const hasAllColumns = requiredColumns.every((col) =>
    headers.some((h) => h === col || h === col.replace('option', 'option_'))
  );

  if (!hasAllColumns) {
    return {
      data: [],
      error: t('createQuizForm.invalidFormat').replace('{columns}', headers.join(', ')),
    };
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
