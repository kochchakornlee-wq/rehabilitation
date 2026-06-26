"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AssessorAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AssessorAutocomplete({
  value,
  onChange,
  placeholder = "Dr. / นพ. / พท.",
  className = "",
}: AssessorAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch suggestions when user types ──────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      // ดึงชื่อที่ unique จาก column assessor_name ในทุก table ที่มี
      // ปรับ table name ให้ตรงกับ schema จริง
      const { data, error } = await supabase
        .from("mobility_assessment")
        .select("assessor_name")
        .ilike("assessor_name", `%${value.trim()}%`)
        .not("assessor_name", "is", null)
        .limit(8);

      if (error || !data) return;

      // deduplicate
      const names = [...new Set(data.map((r) => r.assessor_name as string))];
      setSuggestions(names);
      setOpen(names.length > 0);
      setActiveIndex(-1);
    }, 250);
  }, [value]);

  // ── Close on outside click ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectSuggestion = (name: string) => {
    onChange(name);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={[
          "w-full text-sm px-3 py-1.5 rounded-md border border-input bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-ring",
          className,
        ].join(" ")}
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto">
          {suggestions.map((name, i) => (
            <li
              key={name}
              onMouseDown={() => selectSuggestion(name)} // mousedown ก่อน blur
              className={[
                "px-3 py-2 text-sm cursor-pointer text-gray-700",
                i === activeIndex ? "bg-blue-50 text-blue-800" : "hover:bg-gray-50",
              ].join(" ")}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}