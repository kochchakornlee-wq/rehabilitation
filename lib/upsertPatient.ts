// เขียนครั้งเดียว เรียกใช้ได้ทุกฟอร์ม
export async function upsertPatient(
  db: any,
  patientInfo: {
    hn: string;
    name: string;
    dob?: string;
    gender?: "Male" | "Female";
    allergies?: string;
    patient_type?: "Thai" | "Expat" | "Fly-in";
    visit_type?: "New" | "Old";
  },
) {
  if (!patientInfo?.hn) return;
  await db.query(
    `INSERT INTO patients 
     (hn, name, birthdate, gender, allergies, patient_type, visit_type, last_visit)
   VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
   ON DUPLICATE KEY UPDATE
     name         = VALUES(name),
     birthdate    = VALUES(birthdate),
     gender       = VALUES(gender),
     allergies    = VALUES(allergies),
     patient_type = COALESCE(VALUES(patient_type), patient_type),
     visit_type   = CASE WHEN visit_type IS NULL THEN 'New' ELSE 'Old' END,
     last_visit   = CURDATE()`,
    [
      patientInfo.hn,
      patientInfo.name ?? null,
      patientInfo.dob ?? null,
      patientInfo.gender ?? null,
      patientInfo.allergies ?? null,
      patientInfo.patient_type ?? null,
      patientInfo.visit_type ?? null,
    ],
  );
}
