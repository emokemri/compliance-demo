"""
Policy-to-Audit Mapper: maps an uploaded AI system description to
EU AI Act compliance obligations using the Claude API.
"""
from __future__ import annotations

import json
import os
import re
from groq import Groq
from pydantic import BaseModel

CATEGORIES = [
    "Risk Management",
    "Data Governance",
    "Transparency",
    "Human Oversight",
    "Accuracy & Robustness",
]

EVIDENCE_TYPES = [
    "Technical doc",
    "Test result",
    "Human review",
    "Log",
    "Policy doc",
]

EU_AI_ACT_OBLIGATIONS = """
RELEVANT EU AI ACT OBLIGATIONS FOR HIGH-RISK AI SYSTEMS
========================================================

Article 9 — Risk Management System
§1. High-risk AI systems shall have a risk management system implemented and maintained throughout the entire lifecycle.
§2. The risk management process must include: identification and analysis of known and reasonably foreseeable risks; estimation and evaluation of risks that may emerge when used as intended; evaluation of risks arising from reasonably foreseeable misuse.
§3. Risk management measures shall be adopted for the identified risks; residual risks must be communicated to users.

Article 10 — Data and Data Governance
§1. Training, validation, and testing datasets must be subject to data governance and management practices.
§2. Datasets must be relevant, representative, free of errors, and sufficiently complete with regard to the intended purpose.
§3. Datasets must take into account the characteristics of the specific geographical, behavioural or functional setting within which the high-risk AI system is intended to be used.
§4. Appropriate data governance practices including: examination for possible biases; identification of relevant data gaps or shortcomings; relevant statistical properties.

Article 11 — Technical Documentation
§1. Technical documentation must be drawn up before the high-risk AI system is placed on the market.
§2. Documentation must demonstrate that the system complies with the requirements of this Regulation and provide national competent authorities with all necessary information.

Annex IV §1 — General Description
Full description of the AI system including its intended purpose, version, and deployment context.

Annex IV §2 — Design and Development
Description of the design specifications, assumptions, and the training methodologies including training data.

Annex IV §3 — Architecture and Computing Resources
Description of the system architecture and computing resources used.

Article 12 — Record-Keeping (Logs)
§1. High-risk AI systems shall be designed and developed with capabilities enabling the automatic recording of events ('logs') while in operation.
§2. Logging capabilities must allow monitoring of the operation of the high-risk AI system with respect to the occurrence of situations that may result in the AI system presenting a risk.
§3. For biometric identification systems, logs shall include at minimum: the period of each use; the reference database against which the input data was checked; the input data that led to hits.

Article 13 — Transparency and Provision of Information to Deployers
§1. High-risk AI systems shall be designed and developed in such a way as to ensure that their operation is sufficiently transparent.
§2. High-risk AI systems shall be accompanied by instructions for use in an appropriate digital format.
§3. The instructions for use must include: the identity of the provider; the intended purpose; the level of accuracy, robustness, and cybersecurity performance; any known or foreseeable circumstances that may lead to risks to health, safety, or fundamental rights.

Article 14 — Human Oversight
§1. High-risk AI systems shall be designed and developed in such a way that they can be effectively overseen by natural persons during the period in which the AI system is in use.
§2. Human oversight measures must enable persons overseeing the AI system to understand the capabilities and limitations of the high-risk AI system, including detecting and addressing anomalies and failures.
§3. The system must allow oversight persons to intervene in real time and to interrupt the system through a stop button or similar procedure.
§4. Oversight persons must be able to decide, in any particular situation, not to use the high-risk AI system or to disregard, override, or reverse the output.

Article 15 — Accuracy, Robustness, and Cybersecurity
§1. High-risk AI systems shall be designed and developed in such a way that they achieve an appropriate level of accuracy, robustness, and cybersecurity.
§2. The levels of accuracy and the relevant accuracy metrics must be declared in the accompanying instructions of use.
§3. High-risk AI systems shall be resilient with regard to errors, faults or inconsistencies that may occur within the system or the environment in which it operates.
§4. The technical robustness of AI systems shall include resilience against attempts to alter their use or performance by malicious third parties.

Article 16 — Obligations of Providers
Providers must: draw up technical documentation; comply with the conformity assessment procedure; register the AI system in the EU database; affix the CE marking; keep logs and event records.

Article 17 — Quality Management System
§1. Providers of high-risk AI systems shall put in place a quality management system that ensures compliance with this Regulation.
§2. The quality management system shall include: a strategy for regulatory compliance; techniques, procedures and systematic actions to be used for design, development control and design verification; examination and testing procedures; responsibilities and reporting lines.

Annex IV §6 — Post-Market Monitoring
Description of the post-market monitoring system established by the provider, including a description of any systems used to collect, store, and analyse data relevant to the functioning of the AI system.
"""

SYSTEM_PROMPT = f"""You are an EU AI Act compliance expert. Your task is to analyse an AI system description and map it to specific compliance obligations under the EU AI Act.

{EU_AI_ACT_OBLIGATIONS}

You must output ONLY a valid JSON array — no preamble, no explanation, no markdown fences.

Each element must follow this exact schema:
{{
  "id": "<short_unique_id like 'rm-001'>",
  "obligation": "<concise description of what the system must do or have>",
  "article_ref": "<exact reference like 'Article 9 §1' or 'Annex IV §2'>",
  "category": "<one of: Risk Management | Data Governance | Transparency | Human Oversight | Accuracy & Robustness>",
  "evidence_type": "<one of: Technical doc | Test result | Human review | Log | Policy doc>",
  "status": "pending"
}}

Rules:
- Generate 12–16 checklist items, covering all 5 categories
- Map every obligation to the single most relevant article or annex reference above
- Tailor the obligation text specifically to the system described (use its domain, deployment context, and features)
- Use the exact category and evidence_type values listed — no deviations
- All items start with status "pending"
- Output ONLY the JSON array, nothing else
"""

REPORT_SYSTEM_PROMPT = """You are an EU AI Act compliance specialist drafting an EU Declaration of Conformity.

Generate a professionally formatted compliance report in Markdown. Use the checklist data and system summary provided.

Structure the report with these exact sections:
1. # EU AI Act Compliance Report (with system name and date)
2. ## System Overview (brief description)
3. ## Compliance Summary (score, status classification, brief narrative)
4. ## Checklist Results by Category (subsections per category with table of items)
5. ## Declaration Statement (formal declaration text with placeholders for signatures)

Use professional, regulatory language. Be specific about the AI system. The declaration should be realistic and reference the EU AI Act Regulation (EU) 2024/1689.

Output ONLY the Markdown content, starting with the # heading.
"""


class ChecklistItem(BaseModel):
    id: str
    obligation: str
    article_ref: str
    category: str
    evidence_type: str
    status: str


def map_policy_to_checklist(document_text: str) -> list[ChecklistItem]:
    """
    Calls the Claude API to extract EU AI Act compliance obligations
    from the given AI system description text.
    """
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=4096,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Analyse this AI system and generate the compliance checklist:\n\n{document_text}",
            },
        ],
    )

    raw = response.choices[0].message.content.strip()

    # Strip any accidental markdown fences
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    items_data = json.loads(raw)
    return [ChecklistItem(**item) for item in items_data]


def generate_system_summary(document_text: str) -> str:
    """Generates a brief system summary from the document text."""
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=256,
        messages=[
            {
                "role": "user",
                "content": (
                    "Summarise this AI system description in 2–3 concise sentences "
                    "suitable for a compliance report header. Focus on the system name, "
                    f"purpose, and deployment context:\n\n{document_text}"
                ),
            }
        ],
    )
    return response.choices[0].message.content.strip()


def generate_compliance_report(
    checklist: list[dict], system_summary: str
) -> str:
    """
    Calls the Claude API to generate a formatted EU Declaration of Conformity
    draft in Markdown from the checklist data.
    """
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    # Compute score
    total = len(checklist)
    passed = sum(1 for item in checklist if item.get("status") == "pass")
    score = round((passed / total) * 100) if total > 0 else 0

    checklist_text = json.dumps(checklist, indent=2)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=4096,
        messages=[
            {"role": "system", "content": REPORT_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"System Summary: {system_summary}\n\n"
                    f"Compliance Score: {score}% ({passed}/{total} items passed)\n\n"
                    f"Checklist Items:\n{checklist_text}"
                ),
            },
        ],
    )

    return response.choices[0].message.content.strip()
