// lib/useActiveHN.ts
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useActiveHN() {
  const searchParams = useSearchParams();
  const [hn, setHN] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("hn");
    if (fromUrl) {
      localStorage.setItem("activeHN", fromUrl);
      setHN(fromUrl);
    } else {
      // fallback จาก localStorage เสมอ ถ้า URL ไม่มี hn
      const stored = localStorage.getItem("activeHN") ?? "";
      setHN(stored);
    }
  }, [searchParams]); // ← เพิ่ม searchParams เป็น dependency

  return hn;
}
