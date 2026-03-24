export type Status = "pending" | "pass" | "fail";

export type Category =
  | "Risk Management"
  | "Data Governance"
  | "Transparency"
  | "Human Oversight"
  | "Accuracy & Robustness";

export type EvidenceType =
  | "Technical doc"
  | "Test result"
  | "Human review"
  | "Log"
  | "Policy doc";

export interface ChecklistItem {
  id: string;
  obligation: string;
  article_ref: string;
  category: Category;
  evidence_type: EvidenceType;
  status: Status;
}

export const CATEGORIES: Category[] = [
  "Risk Management",
  "Data Governance",
  "Transparency",
  "Human Oversight",
  "Accuracy & Robustness",
];

export const EXAMPLE_SYSTEM = `System name: MediScan AI v2.3
Type: Medical image classification system
Purpose: Automated detection of anomalies in chest X-ray images to assist radiologists in prioritising urgent cases.
Deployment: Used in 3 NHS Trust hospitals across Denmark and the UK.
Training data: 450,000 annotated chest X-ray images from 12 hospital datasets (2015–2023).
Output: Risk score (0–100) and anomaly classification with bounding box overlay.
Human oversight: A qualified radiologist reviews all flagged cases before any clinical decision is made.
Affected persons: Adult patients undergoing chest X-ray examination.`;
