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
    `
    INSERT INTO patients 
      (hn, name, dob, gender, allergies, patient_type, visit_type, last_synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      name           = VALUES(name),
      dob            = VALUES(dob),
      gender         = VALUES(gender),
      allergies      = VALUES(allergies),
      patient_type   = VALUES(patient_type),
      visit_type     = VALUES(visit_type),
      last_synced_at = NOW()
  `,
    [
      patientInfo.hn,
      patientInfo.name,
      patientInfo.dob,
      patientInfo.gender,
      patientInfo.allergies,
      patientInfo.patient_type,
      patientInfo.visit_type,
    ],
  );
}
