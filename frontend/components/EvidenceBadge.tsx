import type { EvidenceType } from "@/lib/types";

const MAP: Record<EvidenceType, string> = {
  "Technical doc": "badge-technical",
  "Test result": "badge-test",
  "Human review": "badge-human",
  Log: "badge-log",
  "Policy doc": "badge-policy",
};

const ICONS: Record<EvidenceType, string> = {
  "Technical doc": "📄",
  "Test result": "🧪",
  "Human review": "👤",
  Log: "📋",
  "Policy doc": "📜",
};

export default function EvidenceBadge({ type }: { type: EvidenceType }) {
  return (
    <span className={MAP[type] ?? "badge bg-gray-100 text-gray-600"}>
      <span className="mr-1">{ICONS[type]}</span>
      {type}
    </span>
  );
}
