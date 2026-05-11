import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Results — Your AI Savings Report",
  description:
    "See your personalized AI tool optimization recommendations and discover exactly how much you could save monthly and annually.",
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
