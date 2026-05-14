import { en } from './en';
import { hi } from './hi';
import type { Language } from './config';

export const translations = {
  en,
  hi,
};

type TranslationTree = typeof en;

type NestedTranslationKey<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${NestedTranslationKey<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = NestedTranslationKey<TranslationTree>;
export type TranslationKeyInput = TranslationKey | (string & {});

function resolveTranslationValue(
  dictionary: TranslationTree,
  key: TranslationKey
): string | undefined {
  const keys = key.split('.');
  let value: unknown = dictionary;

  for (const segment of keys) {
    if (typeof value !== 'object' || value === null) {
      return undefined;
    }
    value = (value as Record<string, unknown>)[segment];
  }

  return typeof value === 'string' ? value : undefined;
}

export function translate(
  language: Language,
  key: TranslationKeyInput,
  params?: Record<string, string | number>
): string {
  let result =
    resolveTranslationValue(translations[language], key as TranslationKey) ??
    resolveTranslationValue(translations.en, key as TranslationKey) ??
    key;

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
    });
  }

  return result;
}

export type { Language };
