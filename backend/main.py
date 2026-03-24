"""
Compliance Copilot — FastAPI backend
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mapper import (
    ChecklistItem,
    generate_compliance_report,
    generate_system_summary,
    map_policy_to_checklist,
)

app = FastAPI(title="Compliance Copilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ──────────────────────────────────────────────────


class AnalyseRequest(BaseModel):
    text: str


class AnalyseResponse(BaseModel):
    checklist: list[ChecklistItem]
    system_summary: str


class ReportRequest(BaseModel):
    checklist: list[dict]
    system_summary: str


class ReportResponse(BaseModel):
    markdown: str


# ── Endpoints ──────────────────────────────────────────────────────────────────


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/analyse", response_model=AnalyseResponse)
def analyse(request: AnalyseRequest) -> AnalyseResponse:
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Document text must not be empty.")

    try:
        checklist = map_policy_to_checklist(request.text)
        summary = generate_system_summary(request.text)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Claude API error: {exc}",
        ) from exc

    return AnalyseResponse(checklist=checklist, system_summary=summary)


@app.post("/api/report", response_model=ReportResponse)
def report(request: ReportRequest) -> ReportResponse:
    if not request.checklist:
        raise HTTPException(status_code=400, detail="Checklist must not be empty.")

    try:
        markdown = generate_compliance_report(request.checklist, request.system_summary)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Claude API error: {exc}",
        ) from exc

    return ReportResponse(markdown=markdown)
