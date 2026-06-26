import type { PdfFormHelpers } from "../formHelpers";

export type HipPdfPayload = {
  PatientName?: string;
  HN?: string;
  Age?: string;
  Gender?: string;
  VisitDate?: string;
  VN?: string;
  Allergies?: string;
  DOB?: string;
  lang?: "th" | "en";
  VisitType?: string;
  VisitTypeEN?: string;
  assessor_name?: string;
  assessor_date?: string;
  assessor_time?: string;
  notes?: string;
  pain_total?: number;
  pain_percent?: number;
  act_total?: number;
  act_percent?: number;
} & Record<string, string | number | null | undefined>;

// hip.ts
export const PAIN_IDS = [
  "straightening",
  "bending",
  "sitting",
  "standing",
  "walking",
];

export const ACT_IDS = ["lying", "sitting", "rising", "standing", "walking"];

type VisitPrefix = {
  pain: string;
  total: string;
  percent: string;
  date: string;
};

const VISIT_PREFIX_TH: Record<string, VisitPrefix> = {
  ก่อนผ่าตัด: {
    pain: "bf_",
    total: "bf total",
    percent: "bf percentage",
    date: "pain bf date",
  },
  หลังผ่าตัด: {
    pain: "af ",
    total: "af total",
    percent: "af percentage",
    date: "pain af date",
  },
  "หลังผ่าตัด 1 เดือน": {
    pain: "af1m ",
    total: "af1m total",
    percent: "af1m percentage",
    date: "pain af1m date",
  },
};

const VISIT_DAILY_TH: Record<string, VisitPrefix> = {
  ก่อนผ่าตัด: {
    pain: "daily bf ",
    total: "daily bf total",
    percent: "daily bf percentage",
    date: "daily bf date",
  },
  หลังผ่าตัด: {
    pain: "daily af ",
    total: "daily af total",
    percent: "daily af percentage",
    date: "daily af date",
  },
  "หลังผ่าตัด 1 เดือน": {
    pain: "daily af1m ",
    total: "daily af1m total",
    percent: "daily af1m percentage",
    date: "daily af1m date",
  },
};

const VISIT_PREFIX_EN: Record<string, VisitPrefix> = {
  ก่อนผ่าตัด: {
    pain: "pain pre ",
    total: "pain pre total",
    percent: "pain pre percentage",
    date: "pre date",
  },
  หลังผ่าตัด: {
    pain: "pain post ",
    total: "pain post total",
    percent: "pain post percentage",
    date: "post date",
  },
  "หลังผ่าตัด 1 เดือน": {
    pain: "pain post 1 month ",
    total: "pain post 1 month total",
    percent: "pain post 1 month percentage",
    date: "post 1 mont date",
  },
};

const VISIT_DAILY_EN: Record<string, VisitPrefix> = {
  ก่อนผ่าตัด: {
    pain: "daily pre ",
    total: "daily pre total",
    percent: "daily pre percentage",
    date: "daily pre date",
  },
  หลังผ่าตัด: {
    pain: "daily post ",
    total: "daily post total", // field นี้อยู่ตำแหน่ง Total score ในหน้า PDF
    percent: "daily post percentage",
    date: "daily post date",
  },
  "หลังผ่าตัด 1 เดือน": {
    pain: "daily post 1 month ",
    total: "daily post 1 month total",
    percent: "daily post 1 month percentage",
    date: "daily post 1 month date",
  },
};
const toCol = (id: string) => id.replace(/-/g, "_");

export function fillHipPdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as HipPdfPayload;

  // patient info
  h.setText("patient name", data.PatientName ?? "");
  h.setText("DOB", data.DOB ?? "");
  h.setText("age", data.Age ?? "");
  h.setText("hn", data.HN ?? "");
  h.setText("vn", data.VN ?? "");
  h.setText("visit date", data.VisitDate ?? "");
  h.setText("gender", data.Gender ?? "");
  h.setText("allergies", data.Allergies ?? "");
  h.setText("physiotherapist", data.assessor_name ?? "");
  h.setText("date", data.assessor_date ?? "");
  h.setText("time", data.assessor_time ?? "");

  // ทุก field ถูก set ใน payload แล้ว — แค่ pass through ทุก key ที่เป็น string/number
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" || typeof value === "number") {
      h.setText(key, String(value));
    }
  }
}
