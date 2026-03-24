import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compliance Copilot — EU AI Act",
  description:
    "Automated EU AI Act compliance assessment for high-risk AI systems",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7F77DD] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                Compliance Copilot
              </span>
              <span className="ml-2 text-xs font-medium text-[#7F77DD] bg-[#7F77DD]/10 px-2 py-0.5 rounded-full">
                EU AI Act
              </span>
            </div>
            <div className="ml-auto text-xs text-gray-400">
              Research Demo · Not Legal Advice
            </div>
          </div>
        </header>

        <main className="min-h-screen">{children}</main>

        <footer className="border-t border-gray-200 bg-white mt-16">
          <div className="max-w-5xl mx-auto px-6 py-4 text-center text-xs text-gray-400">
            Compliance Copilot is a research prototype. Outputs are
            AI-generated and do not constitute legal advice. Always consult a
            qualified legal professional for regulatory compliance.
          </div>
        </footer>
      </body>
    </html>
  );
}
