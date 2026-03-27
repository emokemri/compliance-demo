"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadAnalysis, saveAnalysis, saveReport } from "@/lib/store";
import type { ChecklistItem, Status } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import StatusToggle from "@/components/StatusToggle";
import EvidenceBadge from "@/components/EvidenceBadge";

export default function ChecklistPage() {
  const router = useRouter();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [systemSummary, setSystemSummary] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { checklist: stored, systemSummary: summary } = loadAnalysis();
    if (stored.length === 0) {
      router.replace("/");
      return;
    }
    setChecklist(stored);
    setSystemSummary(summary);
  }, [router]);

  function updateStatus(id: string, status: Status) {
    setChecklist((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, status } : item
      );
      const { systemSummary: summary } = loadAnalysis();
      saveAnalysis(updated, summary);
      return updated;
    });
  }

  const total = checklist.length;
  const passed = checklist.filter((i) => i.status === "pass").length;
  const failed = checklist.filter((i) => i.status === "fail").length;
  const pending = checklist.filter((i) => i.status === "pending").length;
  const score = total > 0 ? Math.round((passed / total) * 100) : 0;

  const scoreColor =
    score >= 80
      ? "text-[#1D9E75]"
      : score >= 50
      ? "text-[#BA7517]"
      : "text-[#D85A30]";

  const progressColor =
    score >= 80 ? "bg-[#1D9E75]" : score >= 50 ? "bg-[#BA7517]" : "bg-[#D85A30]";

  async function handleGenerateReport() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist: checklist,
          system_summary: systemSummary,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Server error ${res.status}`);
      }
      const data = await res.json();
      saveReport(data.markdown);
      router.push("/report");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  }

  if (checklist.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Compliance Checklist
          </h1>
          {systemSummary && (
            <p className="text-sm text-gray-500 mt-1 max-w-xl">{systemSummary}</p>
          )}
        </div>
        <button
          onClick={() => router.push("/")}
          className="btn-secondary text-sm"
        >
          ← Start over
        </button>
      </div>

      {/* Score card */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-center gap-6">
          {/* Score ring */}
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-bold tabular-nums ${scoreColor}`}>
              {score}%
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">
                Compliance Score
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {passed} of {total} obligations passed
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1 min-w-40">
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Counts */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />
              <span className="text-gray-600">{passed} Pass</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#BA7517]" />
              <span className="text-gray-600">{pending} Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D85A30]" />
              <span className="text-gray-600">{failed} Fail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist by category */}
      <div className="space-y-8">
        {CATEGORIES.map((category) => {
          const items = checklist.filter((i) => i.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold text-[#7F77DD] uppercase tracking-wide">
                  {category}
                </h2>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">
                  {items.filter((i) => i.status === "pass").length}/{items.length} passed
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`
                      card !p-0 overflow-hidden border-l-4 transition-colors
                      ${item.status === "pass"
                        ? "border-l-[#1D9E75]"
                        : item.status === "fail"
                        ? "border-l-[#D85A30]"
                        : "border-l-[#BA7517]"}
                    `}
                  >
                    <div className="p-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                      {/* Obligation text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {item.obligation}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs font-mono text-[#7F77DD] bg-[#7F77DD]/8 px-2 py-0.5 rounded">
                            {item.article_ref}
                          </span>
                          <EvidenceBadge type={item.evidence_type} />
                        </div>
                      </div>

                      {/* Status toggle */}
                      <div className="shrink-0 self-start sm:self-center">
                        <StatusToggle
                          status={item.status}
                          onChange={(s) => updateStatus(item.id, s)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-2 text-sm text-[#D85A30] bg-[#D85A30]/5 border border-[#D85A30]/20 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Generate report */}
      <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="btn-primary w-full sm:w-auto px-8"
        >
          {generating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating Report…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Report
            </>
          )}
        </button>
        <p className="text-xs text-gray-400">
          Click status badges to toggle Pass / Pending / Fail before generating
        </p>
      </div>
    </div>
  );
}
