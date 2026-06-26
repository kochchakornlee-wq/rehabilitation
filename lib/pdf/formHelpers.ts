import type { PDFForm } from "pdf-lib";

export type PdfFormHelpers = {
  setText: (fieldName: string, value: string) => void;
  setCheck: (fieldName: string, checked: boolean) => void;
  setRadio: (groupName: string, value: string) => void;
};

/**
 * ตัวอักษรนอก WinAnsi ที่ผู้ใช้อาจพิมพ์เข้ามาใน form fields
 * pdf-lib จะ throw ทันทีถ้าเจอตัวที่ encode ไม่ได้
 * → แปลงเป็นตัวใกล้เคียงที่อยู่ใน WinAnsi แทน
 */
const NON_WIN_ANSI_MAP: Record<string, string> = {
  // Math / comparison
  "\u2264": "<=", // ≤
  "\u2265": ">=", // ≥
  "\u2260": "!=", // ≠
  "\u00D7": "x", // ×
  "\u00F7": "/", // ÷
  "\u00B1": "+/-", // ±
  "\u2248": "~=", // ≈
  "\u221E": "inf", // ∞
  // Quotes / dashes
  "\u2018": "'", // '
  "\u2019": "'", // '
  "\u201C": '"', // "
  "\u201D": '"', // "
  "\u2013": "-", // –
  "\u2014": "--", // —
  "\u2026": "...", // …
  // Arrows
  "\u2192": "->", // →
  "\u2190": "<-", // ←
  "\u2194": "<->", // ↔
  // Misc symbols
  "\u00B0": " deg", // °
  "\u00B5": "u", // µ
  "\u2022": "-", // •
  "\u00A9": "(c)", // ©
  "\u00AE": "(R)", // ®
};

const NON_WIN_ANSI_RE = new RegExp(
  Object.keys(NON_WIN_ANSI_MAP)
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "g",
);

/**
 * Sanitize text ก่อนเติมลง PDF field:
 *
 * 1. สระอำ (U+0E33) → \u0E4D\u0E32 (นิยม + สระอา)
 * 2. < > → guillemets ‹ › (ป้องกัน PostScript stream พัง)
 * 3. ตัวอักษรนอก WinAnsi → แปลงเป็น ASCII ใกล้เคียง
 * 4. ตัวที่เหลือนอก WinAnsi (U+0100+) และไม่ใช่ Thai → ตัด ออก
 *    (Thai U+0E00–U+0E7F ผ่านได้ถ้าใช้ Thai font)
 */
export function sanitizePdfText(value: string): string {
  if (!value) return value;
  return value
    .replace(/\u0E33/g, "\u0E4D\u0E32") // สระอำ
    .replace(/</g, "\u2039") // <
    .replace(/>/g, "\u203A") // >
    .replace(NON_WIN_ANSI_RE, (ch) => NON_WIN_ANSI_MAP[ch] ?? "") // known non-WinAnsi
    .replace(/[^\u0000-\u00FF\u0E00-\u0E7F]/g, ""); // strip remaining non-WinAnsi non-Thai
}

export function createFormHelpers(form: PDFForm): PdfFormHelpers {
  const setText = (fieldName: string, value: string) => {
    try {
      form.getTextField(fieldName).setText(sanitizePdfText(value ?? ""));
    } catch {
      /* field ไม่มีใน template — ข้าม */
    }
  };

  const setCheck = (fieldName: string, checked: boolean) => {
    try {
      const cb = form.getCheckBox(fieldName);
      if (checked) {
        cb.check();
      } else {
        cb.uncheck();
      }
    } catch {
      /* ข้าม */
    }
  };

  const setRadio = (groupName: string, value: string) => {
    try {
      if (value) form.getRadioGroup(groupName).select(value);
    } catch {
      /* ข้าม */
    }
  };

  return { setText, setCheck, setRadio };
}
