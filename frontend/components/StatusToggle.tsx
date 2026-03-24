"use client";

import type { Status } from "@/lib/types";

interface Props {
  status: Status;
  onChange: (status: Status) => void;
}

const STATES: { value: Status; label: string; color: string; bg: string; ring: string }[] = [
  {
    value: "pass",
    label: "Pass",
    color: "text-[#1D9E75]",
    bg: "bg-[#1D9E75]",
    ring: "ring-[#1D9E75]",
  },
  {
    value: "pending",
    label: "Pending",
    color: "text-[#BA7517]",
    bg: "bg-[#BA7517]",
    ring: "ring-[#BA7517]",
  },
  {
    value: "fail",
    label: "Fail",
    color: "text-[#D85A30]",
    bg: "bg-[#D85A30]",
    ring: "ring-[#D85A30]",
  },
];

export default function StatusToggle({ status, onChange }: Props) {
  const current = STATES.find((s) => s.value === status) ?? STATES[1];

  function cycle() {
    const idx = STATES.findIndex((s) => s.value === status);
    const next = STATES[(idx + 1) % STATES.length];
    onChange(next.value);
  }

  return (
    <button
      onClick={cycle}
      title="Click to cycle status"
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
        border transition-all hover:opacity-90 active:scale-95
        ${status === "pass"
          ? "bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/20"
          : status === "fail"
          ? "bg-[#D85A30]/10 text-[#D85A30] border-[#D85A30]/20"
          : "bg-[#BA7517]/10 text-[#BA7517] border-[#BA7517]/20"
        }
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${current.bg}`}
      />
      {current.label}
    </button>
  );
}
