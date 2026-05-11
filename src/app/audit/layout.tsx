import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Your AI Tools",
  description:
    "Add your AI tools and monthly spending. We'll calculate your potential savings instantly — no account required.",
};

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
