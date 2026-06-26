"use client";

interface PDFPreviewModalProps {
  show: boolean;
  pdfBase64: string | null;
  loading: boolean;
  error?: string | null;
  title?: string;
  downloadFilename?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function PDFPreviewModal({
  show,
  pdfBase64,
  loading,
  error = null,
  title = "ตรวจสอบข้อมูลก่อนบันทึก",
  downloadFilename = "Form_Preview.pdf",
  onConfirm,
  onClose,
}: PDFPreviewModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              กรุณาตรวจสอบความถูกต้องของข้อมูลในแบบฟอร์มด้านล่าง
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden px-6 py-4 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">กำลังสร้างตัวอย่าง PDF...</p>
            </div>
          ) : pdfBase64 ? (
            <iframe
              src={`data:application/pdf;base64,${pdfBase64}`}
              className="w-full h-[65vh] rounded-lg border border-gray-200"
              title={title}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 gap-2 text-center px-4">
              <p className="text-red-500 text-sm font-medium">
                ไม่สามารถสร้าง PDF preview ได้
              </p>
              {error && (
                <p className="text-gray-500 text-xs max-w-md">{error}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          {pdfBase64 && (
            <a
              href={`data:application/pdf;base64,${pdfBase64}`}
              download={downloadFilename}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              ดาวน์โหลด PDF
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            แก้ไขข้อมูล
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || !pdfBase64}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            ยืนยันบันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
