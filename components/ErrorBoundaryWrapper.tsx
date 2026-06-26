// components/ErrorBoundaryWrapper.tsx
"use client"
import { ErrorBoundary } from "react-error-boundary"

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
      <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
      <button onClick={() => window.location.reload()} className="mt-3 text-blue-500 underline text-sm">
        โหลดใหม่
      </button>
    </div>
  )
}

export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  )
}