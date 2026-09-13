/** The 11 guide languages, each shown in its own script. */
export type GuideLang = {
  code: string;
  /** Endonym — the language's own name in its own script. */
  native: string;
  dir: 'ltr' | 'rtl';
  /** BCP-47 value for hreflang. */
  hreflang: string;
};

export const guideLangs: GuideLang[] = [
  { code: 'en', native: 'English', dir: 'ltr', hreflang: 'en' },
  { code: 'ur', native: 'اردو', dir: 'rtl', hreflang: 'ur' },
  { code: 'ur-Latn', native: 'Roman Urdu', dir: 'ltr', hreflang: 'ur-Latn' },
  { code: 'ar', native: 'العربية', dir: 'rtl', hreflang: 'ar' },
  { code: 'fa', native: 'فارسی', dir: 'rtl', hreflang: 'fa' },
  { code: 'hi', native: 'हिन्दी', dir: 'ltr', hreflang: 'hi' },
  { code: 'bn', native: 'বাংলা', dir: 'ltr', hreflang: 'bn' },
  { code: 'id', native: 'Bahasa Indonesia', dir: 'ltr', hreflang: 'id' },
  { code: 'ms', native: 'Bahasa Melayu', dir: 'ltr', hreflang: 'ms' },
  { code: 'tr', native: 'Türkçe', dir: 'ltr', hreflang: 'tr' },
  { code: 'fr', native: 'Français', dir: 'ltr', hreflang: 'fr' },
];

export const isRtl = (code: string) => guideLangs.find((l) => l.code === code)?.dir === 'rtl';
export const langByCode = (code: string) => guideLangs.find((l) => l.code === code);
