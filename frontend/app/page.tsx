"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { saveAnalysis } from "@/lib/store";
import { EXAMPLE_SYSTEM } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setText((e.target?.result as string) ?? "");
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"], "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  async function handleAnalyse() {
    if (!text.trim()) {
      setError("Please enter or upload a system description first.");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress("Sending to Claude API…");

    try {
      setProgress("Mapping obligations to EU AI Act articles…");
      const res = await fetch("http://localhost:8000/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Server error ${res.status}`);
      }

      const data = await res.json();
      setProgress("Building compliance checklist…");
      saveAnalysis(data.checklist, data.system_summary);
      router.push("/checklist");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      setLoading(false);
      setProgress("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          EU AI Act Compliance Assessment
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Upload a description of your AI system. Compliance Copilot will map
          it to relevant obligations under the EU AI Act and generate a
          structured audit checklist.
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragActive
            ? "border-[#7F77DD] bg-[#7F77DD]/5"
            : "border-gray-200 hover:border-[#7F77DD]/60 hover:bg-gray-50"}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#7F77DD]/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#7F77DD]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          {fileName ? (
            <div>
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-400 mt-1">File loaded. Click Analyse to continue.</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-700">
                {isDragActive ? "Drop the file here" : "Drop a .txt or .pdf file here"}
              </p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">or paste text</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (fileName && e.target.value !== text) setFileName(null);
        }}
        placeholder="Describe your AI system here — its purpose, deployment context, data used, outputs, and oversight mechanisms…"
        rows={9}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/40 focus:border-[#7F77DD] resize-none transition"
      />

      {/* Load example */}
      <button
        onClick={() => {
          setText(EXAMPLE_SYSTEM);
          setFileName(null);
        }}
        className="mt-2 text-xs text-[#7F77DD] hover:text-[#6059C4] font-medium transition"
      >
        Load example system (MediScan AI)
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 text-sm text-[#D85A30] bg-[#D85A30]/5 border border-[#D85A30]/20 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Progress */}
      {loading && (
        <div className="mt-4 flex items-center gap-3 text-sm text-[#7F77DD] bg-[#7F77DD]/5 border border-[#7F77DD]/20 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {progress}
        </div>
      )}

      {/* CTA */}
      <div className="mt-6">
        <button
          onClick={handleAnalyse}
          disabled={loading || !text.trim()}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Analyse System
            </>
          )}
        </button>
      </div>

      {/* Info chips */}
      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {[
          "Article 9–17 coverage",
          "Annex IV obligations",
          "5 compliance categories",
          "Evidence mapping",
        ].map((label) => (
          <span
            key={label}
            className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
