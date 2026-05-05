// types/koos.ts

export type KoosAssessmentType = "before" | "after" | "follow_up"

// ตรงกับ column ใน Supabase
export interface KoosAssessment {
  id: string
  ipd_form_id: string       // FK → ipd_forms.id
  assessment_type: KoosAssessmentType
  assessed_at: string        // ISO date string "YYYY-MM-DD"
  assessed_by: string | null

  p1: number | null
  p2: number | null
  p3: number | null
  p4: number | null
  p5: number | null
  p6: number | null
  p7: number | null
  p8: number | null
  p9: number | null
  pain_score: number | null

  a1: number | null
  a2: number | null
  a3: number | null
  a4: number | null
  a5: number | null
  a6: number | null
  a7: number | null
  a8: number | null
  adl_score: number | null

  created_at: string
  updated_at: string
}

// สำหรับ INSERT (ตัด auto-generated fields ออก)
export type KoosInsert = Omit<KoosAssessment, "id" | "created_at" | "updated_at"> & {
  ipd_form_id: string
}

// ------------------------------------------------------------
// Metadata สำหรับ render form (ใช้ map วนแทนการเขียนซ้ำ)
// ------------------------------------------------------------

export interface ScoreOption {
  label: string
  score: number
}

export interface KoosItem {
  id: keyof KoosScores   // "p2" | "p3" | ... | "a1" | ...
  label: string
}

// เฉพาะ fields ที่เป็น score (ไม่รวม computed / meta)
export type KoosScores = {
  p1: number | null
  p2: number | null
  p3: number | null
  p4: number | null
  p5: number | null
  p6: number | null
  p7: number | null
  p8: number | null
  p9: number | null
  a1: number | null
  a2: number | null
  a3: number | null
  a4: number | null
  a5: number | null
  a6: number | null
  a7: number | null
  a8: number | null
}