"use client";

import { useState, useCallback } from "react";
import { fetchPdfPreview } from "@/lib/pdf/client";
import type { PdfFormType } from "@/lib/pdf/constants";

export type PdfPreviewState = {
  show: boolean;
  base64: string | null;
  loading: boolean;
  error: string | null;
  mode: string;
};

const initialState: PdfPreviewState = {
  show: false,
  base64: null,
  loading: false,
  error: null,
  mode: "default",
};

export function usePdfPreview() {
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewState>(initialState);

  const openPreview = useCallback(
    async (formType: PdfFormType, payload: unknown, mode = "default") => {
      setPdfPreview({
        show: true,
        base64: null,
        loading: true,
        error: null,
        mode,
      });

      const result = await fetchPdfPreview(formType, payload);

      if (result.ok) {
        setPdfPreview({
          show: true,
          base64: result.pdf,
          loading: false,
          error: null,
          mode,
        });
      } else {
        setPdfPreview({
          show: true,
          base64: null,
          loading: false,
          error: result.error,
          mode,
        });
      }
    },
    [],
  );

  const closePreview = useCallback(() => {
    setPdfPreview((prev) => ({ ...prev, show: false }));
  }, []);

  const resetPreview = useCallback(() => {
    setPdfPreview(initialState);
  }, []);

  return { pdfPreview, openPreview, closePreview, resetPreview, setPdfPreview };
}
