"use client";

/**
 * Very simple in-memory store using module-level state +
 * sessionStorage for page-reload persistence in this demo.
 */
import type { ChecklistItem } from "./types";

const STORAGE_KEY = "compliance-copilot-state";

export interface AppState {
  checklist: ChecklistItem[];
  systemSummary: string;
  reportMarkdown: string;
}

function getStore(): AppState {
  if (typeof window === "undefined")
    return { checklist: [], systemSummary: "", reportMarkdown: "" };
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return { checklist: [], systemSummary: "", reportMarkdown: "" };
  return JSON.parse(raw) as AppState;
}

function setStore(state: AppState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveAnalysis(
  checklist: ChecklistItem[],
  systemSummary: string
) {
  const current = getStore();
  setStore({ ...current, checklist, systemSummary, reportMarkdown: "" });
}

export function loadAnalysis(): { checklist: ChecklistItem[]; systemSummary: string } {
  const { checklist, systemSummary } = getStore();
  return { checklist, systemSummary };
}

export function saveReport(markdown: string) {
  const current = getStore();
  setStore({ ...current, reportMarkdown: markdown });
}

export function loadReport(): string {
  return getStore().reportMarkdown;
}

export function clearStore() {
  if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
}
