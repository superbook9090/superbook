import type { ExcelRow } from '../components/types';

/**
 * Normalizes Devanagari Hindi digits (०-९) to standard ASCII digits (0-9).
 */
export function normalizeHindiDigits(str: string): string {
  return str.replace(/[०-९]/g, (d) => (d.charCodeAt(0) - 2406).toString());
}

export interface ParseResult {
  questions: ExcelRow[];
  errors: string[];
}

/**
 * Parses raw unstructured or pasted question text into structured ExcelRow question items.
 *
 * Supports:
 * - Unstructured text without linebreaks (e.g. copied from messaging apps or websites).
 * - Multi-line formatted questions.
 * - Options formatted as A), (A), [A], A:, A -, A. (and Hindi letters क/ख/ग/घ, अ/ब/स/द).
 * - Separate Answer Key & Explanations section at the end.
 * - Inline answers (Answer: B, Ans: C, उत्तर: ख) and explanations (Explanation: ..., व्याख्या: ...).
 */
export function parseRawTextQuestions(rawInput: string): ParseResult {
  if (!rawInput || !rawInput.trim()) {
    return { questions: [], errors: [] };
  }

  const errors: string[] = [];
  const normalizedInput = normalizeHindiDigits(rawInput.trim());

  // 1. Separate questions from Answer Key if present
  // Matches "Answer key...", "Answers:", "Solutions:", "उत्तर कुंजी:", "उत्तर माला:" followed by Question 1 answer
  const akHeaderRegex = /(?:answers?(?:\s*keys?)?(?:\s*(?:and|&)?\s*explanations?)?|solutions?|उत्तर(?:माला|\s*(?:कुंजी|माला|व\s*व्याख्या|और\s*व्याख्या))?)\s*[:\-]?\s*(?=(?:(?:Q(?:uestion)?|प्रश्न|प्र)\s*[-.:]?\s*)?1[-.:\)])/i;
  const akMatch = normalizedInput.match(akHeaderRegex);

  let qSection = normalizedInput;
  let aSection = '';
  if (akMatch && akMatch.index !== undefined) {
    qSection = normalizedInput.substring(0, akMatch.index).trim();
    aSection = normalizedInput.substring(akMatch.index + akMatch[0].length).trim();
  }

  // 2. Parse Answer Key Section
  const answerMap = new Map<number, { optionIndex: number; explanation: string }>();
  if (aSection) {
    let aNum = 1;
    let aCursor = 0;
    const aBlocks: { qNum: number; start: number; contentStart: number }[] = [];

    while (aCursor < aSection.length) {
      const targetStr = aNum.toString();
      const reg = new RegExp(
        `(?:^|[\\s\\n\\r।!?.])(?:(?:Q(?:uestion)?|प्रश्न|प्र)\\s*[-.:]?\\s*)?(${targetStr})[-.:\\)]\\s*`,
        'i'
      );
      const rem = aSection.substring(aCursor);
      const m = rem.match(reg);
      let matchOffset = 0;
      let matchLength = 0;

      if (m && m.index !== undefined) {
        const numOffset = m[0].indexOf(m[1]);
        matchOffset = m.index + numOffset;
        matchLength = m[0].length - numOffset;
      } else {
        const fb = rem.match(new RegExp(`(${targetStr})[-.:\\)]\\s*`, 'i'));
        if (fb && fb.index !== undefined) {
          matchOffset = fb.index;
          matchLength = fb[0].length;
        } else {
          break;
        }
      }

      const start = aCursor + matchOffset;
      const contentStart = start + matchLength;
      aBlocks.push({ qNum: aNum, start, contentStart });
      aCursor = contentStart;
      aNum++;
    }

    for (let i = 0; i < aBlocks.length; i++) {
      const cur = aBlocks[i];
      const nextStart = i + 1 < aBlocks.length ? aBlocks[i + 1].start : aSection.length;
      const snippet = aSection.substring(cur.contentStart, nextStart).trim();

      const letterMatch = snippet.match(
        /^(?:(?:ans(?:wer)?|उत्तर|option|विकल्प)?\s*[:\-]?\s*[\(\[\s]*)([A-Da-d1-4क-घअ-द])(?:[-.:)\]\s]|$)/i
      );
      let optionIndex = -1;
      if (letterMatch) {
        const token = letterMatch[1];
        if (/[A-Da-d]/.test(token)) {
          optionIndex = token.toUpperCase().charCodeAt(0) - 65;
        } else if (/[1-4]/.test(token)) {
          optionIndex = parseInt(token, 10) - 1;
        } else if (token === 'क' || token === 'अ') {
          optionIndex = 0;
        } else if (token === 'ख' || token === 'ब') {
          optionIndex = 1;
        } else if (token === 'ग' || token === 'स') {
          optionIndex = 2;
        } else if (token === 'घ' || token === 'द') {
          optionIndex = 3;
        }
      }

      let explanation = '';
      const expMatch = snippet.match(/(?:explanation|व्याख्या|solution|विवरण)\s*[:\-]?\s*([\s\S]*)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
      }

      if (optionIndex >= 0 && optionIndex <= 3) {
        answerMap.set(cur.qNum, { optionIndex, explanation });
      }
    }
  }

  // 3. Sequentially parse questions
  const parsedQuestions: ExcelRow[] = [];
  let qNum = 1;
  let qCursor = 0;

  const q1Match = qSection.match(/(?:^|[\s\n\r])(?:(?:Q(?:uestion)?|प्रश्न|प्र)\s*[-.:]?\s*)?1[-.:\)]\s*/i);
  if (!q1Match || q1Match.index === undefined) {
    return {
      questions: [],
      errors: ['No question numbered 1 found in pasted text. Please start questions with 1. or Q1.']
    };
  }
  qCursor = q1Match.index + q1Match[0].length;

  const findOptMarker = (text: string, letterIndex: number) => {
    const letter = String.fromCharCode(65 + letterIndex);
    const hindiKa = ['क', 'ख', 'ग', 'घ'][letterIndex];
    const hindiA = ['अ', 'ब', 'स', 'द'][letterIndex];
    const parenNum = ['1', '2', '3', '4'][letterIndex];

    // 1. English letter: A), (A), [A], A:, A-
    let m = text.match(
      new RegExp(
        `(?:^|[\\s\\n\\r]|(?<=[^a-zA-Z]))(?:(\\(${letter}\\))|(\\[${letter}\\])|(${letter}\\s*[-:\\)]))\\s*`,
        'i'
      )
    );
    if (!m) {
      // 2. Hindi paren: (क), (अ) or क), अ)
      m = text.match(
        new RegExp(
          `(?:^|[\\s\\n\\r]|(?<=[^\\u0900-\\u097F]))(?:(\\([${hindiKa}${hindiA}]\\))|(\\[[${hindiKa}${hindiA}]\\])|((?:[${hindiKa}${hindiA}])\\s*[-:\\)]))\\s*`
        )
      );
    }
    if (!m) {
      // 3. (1), (2), (3), (4) strictly in parentheses or brackets
      m = text.match(new RegExp(`(?:^|[\\s\\n\\r])(?:\\(${parenNum}\\)|\\[${parenNum}\\])\\s*`));
    }
    if (!m) {
      // 4. English A. dot notation
      m = text.match(new RegExp(`(?:^|[\\s\\n\\r])${letter}\\.\\s*`, 'i'));
    }
    return m;
  };

  while (qCursor < qSection.length) {
    const nextQNum = qNum + 1;
    const nextQNumStr = nextQNum.toString();
    const rem = qSection.substring(qCursor);

    const aMatch = findOptMarker(rem, 0);
    if (!aMatch || aMatch.index === undefined) break;

    const afterA = rem.substring(aMatch.index + aMatch[0].length);
    const bMatch = findOptMarker(afterA, 1);
    if (!bMatch || bMatch.index === undefined) break;

    const afterB = afterA.substring(bMatch.index + bMatch[0].length);
    const cMatch = findOptMarker(afterB, 2);
    if (!cMatch || cMatch.index === undefined) break;

    const afterC = afterB.substring(cMatch.index + cMatch[0].length);
    const dMatch = findOptMarker(afterC, 3);
    if (!dMatch || dMatch.index === undefined) break;

    const afterD = afterC.substring(dMatch.index + dMatch[0].length);

    let nextQPosInAfterD = -1;
    let nextQMatchLength = 0;

    const nextQRegex = new RegExp(
      `(?:^|[\\s\\n\\r।!?\\.])(?:(?:Q(?:uestion)?|प्रश्न|प्र)\\s*[-.:]?\\s*)?(${nextQNumStr})[-.:\\)]\\s*`,
      'i'
    );
    const nqM = afterD.match(nextQRegex);
    if (nqM && nqM.index !== undefined) {
      const numOffset = nqM[0].indexOf(nqM[1]);
      nextQPosInAfterD = nqM.index + numOffset;
      nextQMatchLength = nqM[0].length - numOffset;
    } else {
      const fallbackRegex = new RegExp(`(${nextQNumStr})[-.:\\)]\\s*`, 'i');
      const fb = afterD.match(fallbackRegex);
      if (fb && fb.index !== undefined) {
        nextQPosInAfterD = fb.index;
        nextQMatchLength = fb[0].length;
      }
    }

    const questionPrompt = rem.substring(0, aMatch.index).trim();
    const optA = afterA.substring(0, bMatch.index).trim();
    const optB = afterB.substring(0, cMatch.index).trim();
    const optC = afterC.substring(0, dMatch.index).trim();

    let optD = '';
    if (nextQPosInAfterD !== -1) {
      optD = afterD.substring(0, nextQPosInAfterD).trim();
      qCursor =
        qCursor +
        aMatch.index +
        aMatch[0].length +
        bMatch.index +
        bMatch[0].length +
        cMatch.index +
        cMatch[0].length +
        dMatch.index +
        dMatch[0].length +
        nextQPosInAfterD +
        nextQMatchLength;
    } else {
      optD = afterD.trim();
      qCursor = qSection.length;
    }

    let correctAnswer = 0;
    let explanation = '';

    if (answerMap.has(qNum)) {
      const aInfo = answerMap.get(qNum)!;
      correctAnswer = aInfo.optionIndex;
      explanation = aInfo.explanation;
    } else {
      const inlineAns = optD.match(
        /(?:ans(?:wer)?|उत्तर|correct)\s*[:\-]?\s*(?:(?:option|विकल्प)\s*)?[\(\[\s]*([A-Da-d1-4क-घअ-द])/i
      );
      const expMatch = optD.match(/(?:explanation|व्याख्या|solution|विवरण)\s*[:\-]?\s*([\s\S]*)/i);

      if (inlineAns && inlineAns.index !== undefined) {
        const token = inlineAns[1];
        if (/[A-Da-d]/.test(token)) {
          correctAnswer = token.toUpperCase().charCodeAt(0) - 65;
        } else if (/[1-4]/.test(token)) {
          correctAnswer = parseInt(token, 10) - 1;
        } else if (token === 'क' || token === 'अ') {
          correctAnswer = 0;
        } else if (token === 'ख' || token === 'ब') {
          correctAnswer = 1;
        } else if (token === 'ग' || token === 'स') {
          correctAnswer = 2;
        } else if (token === 'घ' || token === 'द') {
          correctAnswer = 3;
        }

        if (expMatch && expMatch.index !== undefined) {
          explanation = expMatch[1].trim();
        }

        const cutIndex =
          expMatch && expMatch.index !== undefined && expMatch.index < inlineAns.index
            ? expMatch.index
            : inlineAns.index;
        optD = optD.substring(0, cutIndex).trim();
      }
    }

    parsedQuestions.push({
      question: questionPrompt,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctAnswer,
      ...(explanation ? { explanation } : {})
    });

    qNum++;
  }

  return { questions: parsedQuestions, errors };
}
