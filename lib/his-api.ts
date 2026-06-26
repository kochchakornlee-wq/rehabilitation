const BASE_URL = process.env.NEXT_PUBLIC_HIS_API_URL;
const API_KEY = process.env.HIS_API_KEY; // server-side only

export async function getPatientByHN(hn: string) {
  const res = await fetch(`${BASE_URL}/patient/hn/${hn}`, {
    headers: { 'X-API-Key': API_KEY! },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to fetch patient');
  }

  return res.json(); // { success, data: { hn, name, age, ... } }
}