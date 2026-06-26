import {
  PDFCheckBox,
  PDFDocument,
  PDFForm,
  PDFTextField,
  StandardFonts,
  componentsToColor,
  drawCheckBox,
  rgb,
  rotateInPlace,
} from "pdf-lib";
import { adjustDimsForRotation, reduceRotation } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import {
  TEXT_FIELD_DEFAULT_FONT_SIZE,
  TEXT_FIELD_FONT_SCALE,
  TEXT_FIELD_MIN_FONT_SIZE,
  PDF_TEMPLATES_DIR,
} from "./constants";

const RED = rgb(1, 0, 0);

/**
 * Custom checkbox appearance provider — red check mark (✓) when checked.
 */
export function redCheckBoxAppearanceProvider(
  _checkBox: PDFCheckBox,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  widget: any,
) {
  const rectangle = widget.getRectangle();
  const ap = widget.getAppearanceCharacteristics();
  const bs = widget.getBorderStyle();

  const borderWidth = bs?.getWidth() ?? 0;
  const rotation = reduceRotation(ap?.getRotation());
  const { width, height } = adjustDimsForRotation(rectangle, rotation);
  const rotate = rotateInPlace({ ...rectangle, rotation });

  const black = rgb(0, 0, 0);
  const borderColor = componentsToColor(ap?.getBorderColor()) ?? black;
  const normalBackgroundColor = componentsToColor(ap?.getBackgroundColor());
  const downBackgroundColor = componentsToColor(ap?.getBackgroundColor(), 0.8);

  const options = {
    x: 0 + borderWidth / 2,
    y: 0 + borderWidth / 2,
    width: width - borderWidth,
    height: height - borderWidth,
    thickness: 1.8,
    borderWidth,
    borderColor,
    markColor: RED,
  };

  const draw = (filled: boolean, bg?: unknown) => [
    ...rotate,
    ...drawCheckBox({
      ...options,
      color: bg as Parameters<typeof drawCheckBox>[0]["color"],
      filled,
    }),
  ];

  return {
    normal: {
      on: draw(true, normalBackgroundColor),
      off: draw(false, normalBackgroundColor),
    },
    down: {
      on: draw(true, downBackgroundColor),
      off: draw(false, downBackgroundColor),
    },
  };
}

export function scaleTextFieldFontSizes(form: PDFForm) {
  for (const field of form.getFields()) {
    if (!(field instanceof PDFTextField)) continue;
    try {
      const da = field.acroField.getDefaultAppearance() ?? "";
      const sizeMatch = da.match(/(\d*\.\d+|\d+)\s+Tf/);
      const current = sizeMatch
        ? Number(sizeMatch[1])
        : TEXT_FIELD_DEFAULT_FONT_SIZE;
      const scaled = Math.max(
        TEXT_FIELD_MIN_FONT_SIZE,
        Math.round(current * TEXT_FIELD_FONT_SCALE * 10) / 10,
      );
      field.setFontSize(scaled);
    } catch {
      /* skip fields that cannot be resized */
    }
  }
}

export function applyRedCheckboxAppearances(form: PDFForm) {
  for (const field of form.getFields()) {
    if (!(field instanceof PDFCheckBox)) continue;
    try {
      field.updateAppearances(redCheckBoxAppearanceProvider);
    } catch {
      /* skip */
    }
  }
}

export async function finalizeFormAppearances(
  pdfDoc: PDFDocument,
  form: PDFForm,
) {
  scaleTextFieldFontSizes(form);

  // ─── Embed Thai font ──────────────────────────────────────────────────────
  // ลอง load จาก public/fonts/ ก่อน ถ้าไม่มีค่อย fallback เป็น Helvetica
  let thaiFont: Awaited<ReturnType<typeof pdfDoc.embedFont>> | null = null;
  const thaiFontCandidates = [
    path.join(PDF_TEMPLATES_DIR, "../fonts/THSarabunNew.ttf"),
    path.join(PDF_TEMPLATES_DIR, "../fonts/NotoSansThai.ttf"),
  ];

  for (const fontPath of thaiFontCandidates) {
    if (fs.existsSync(fontPath)) {
      try {
        pdfDoc.registerFontkit(fontkit);
        const fontBytes = fs.readFileSync(fontPath);
        thaiFont = await pdfDoc.embedFont(fontBytes, { subset: true });
        break;
      } catch {
        /* try next */
      }
    }
  }

  // ─── Set font ONLY on TextFields ─────────────────────────────────────────
  // การ updateFieldAppearances(font) แบบเหมาหมดทำให้ checkbox พัง
  // เพราะ pdf-lib จะพยายาม embed font เข้า checkbox widget ซึ่งไม่รองรับ
  if (thaiFont) {
    for (const field of form.getFields()) {
      if (!(field instanceof PDFTextField)) continue;
      try {
        field.updateAppearances(thaiFont);
      } catch {
        /* skip */
      }
    }
  } else {
    // Fallback: Helvetica เฉพาะ TextField (Latin only)
    const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    for (const field of form.getFields()) {
      if (!(field instanceof PDFTextField)) continue;
      try {
        field.updateAppearances(fallbackFont);
      } catch {
        /* skip */
      }
    }
  }

  // ─── Apply red checkbox appearances ──────────────────────────────────────
  // ทำหลัง text field loop เท่านั้น
  // ห้าม form.updateFieldAppearances() อีกรอบ เพราะจะ override ฟอนต์ไทยด้วย WinAnsi
  applyRedCheckboxAppearances(form);
}
