export type ReportNavItem = {
  slug: string;
  title: string;
  description: string;
};

export const CLIENT_REPORTS: ReportNavItem[] = [
  {
    slug: "overview",
    title: "Activity overview",
    description: "High-level participation and engagement summary.",
  },
  {
    slug: "participants",
    title: "Participant progress",
    description: "Status and completion trends by participant.",
  },
  {
    slug: "engagement",
    title: "Engagement trends",
    description: "Session frequency, duration, and return patterns.",
  },
  {
    slug: "milestones",
    title: "Milestones & outcomes",
    description: "Key completions and outcome markers over time.",
  },
];

export function getReport(slug: string) {
  return CLIENT_REPORTS.find((report) => report.slug === slug);
}
