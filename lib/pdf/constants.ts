import path from "path";

export const PDF_TEMPLATES_DIR = path.join(
  process.cwd(),
  "public",
  "templates",
);

export const PDF_TEMPLATE_FILES = {
  opd: "OPD_template.pdf",
  ipd: "IPD-template.pdf",
  discharge: "Discharge_template.pdf",
  hip_th: "Hoos_TH_template.pdf",
  hip_en: "Hoos_EN_template.pdf",
  hip17: "Hoos_TH_template.pdf",
  koos_th: "koos_TH.pdf",
  koos_en: "Koos_EN.pdf",
  koos: "koos_TH_template.pdf", // route จะเลือก template เองตาม lang
  rankin: "THE_MODIFIED_RANKIN.pdf",
  barthel: "Barthel Index_template.pdf",
  timeup: "Time Up_template.pdf",
  cancer: "cancer_template.pdf",
} as const;

export type PdfFormType = keyof typeof PDF_TEMPLATE_FILES;

/** Scale factor applied to every text field font size (smaller = fits boxes better). */
export const TEXT_FIELD_FONT_SCALE = 1.0;

/** Minimum font size after scaling. */
export const TEXT_FIELD_MIN_FONT_SIZE = 13;

/** Default font size when the PDF field has none set. */
export const TEXT_FIELD_DEFAULT_FONT_SIZE = 20;
