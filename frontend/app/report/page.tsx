"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { loadReport, clearStore } from "@/lib/store";

export default function ReportPage() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    const md = loadReport();
    if (!md) {
      router.replace("/checklist");
      return;
    }
    setMarkdown(md);
  }, [router]);

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compliance-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function startOver() {
    clearStore();
    router.push("/");
  }

  if (!markdown) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-400">
        Loading report…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Report</h1>
        <div className="flex items-center gap-2">
          <button onClick={startOver} className="btn-secondary">
            ← Start over
          </button>
          <button onClick={() => router.push("/checklist")} className="btn-secondary">
            ← Edit checklist
          </button>
          <button onClick={downloadMarkdown} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .md
          </button>
        </div>
      </div>

      {/* Report body */}
      <div className="card">
        <div className="prose prose-sm max-w-none prose-headings:text-[#7F77DD] prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-lg prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2 prose-a:text-[#7F77DD] prose-code:text-[#7F77DD] prose-code:bg-[#7F77DD]/8 prose-code:px-1 prose-code:rounded prose-table:text-xs prose-td:py-2 prose-th:py-2 prose-th:text-[#7F77DD]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex justify-end gap-3">
        <button onClick={startOver} className="btn-secondary">
          Start new assessment
        </button>
        <button onClick={downloadMarkdown} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Markdown
        </button>
      </div>
    </div>
  );
}
