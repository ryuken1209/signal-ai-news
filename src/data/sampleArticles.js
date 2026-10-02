// DEV-ONLY FALLBACK DATA.
// Used exclusively by newsService.js when /api/news is unreachable during
// local `vite dev` (which can't serve serverless routes). Never shown in
// production, and never presented as live news — see newsService.js and
// the fallback banner in Home.jsx.

export const CATEGORIES = [
  'AI',
  'Technology',
  'Startups',
  'Research',
  'Programming',
  'Cybersecurity',
]

export const sampleArticles = [
  {
    id: 'a1',
    title: 'Open-weight models close the gap with frontier labs',
    category: 'AI',
    tags: ['LLMs', 'open-source'],
    source: 'The Wire Report',
    publishedAt: '2026-09-16T06:40:00Z',
    readingTimeMin: 6,
    summary:
      'A new wave of openly released models is matching closed frontier systems on reasoning benchmarks, narrowing a gap that held for most of 2025.',
    trending: true,
  },
  {
    id: 'a2',
    title: 'A profiler-first approach to debugging distributed systems',
    category: 'Programming',
    tags: ['systems', 'observability'],
    source: 'Dev Signal',
    publishedAt: '2026-09-16T04:15:00Z',
    readingTimeMin: 9,
    summary:
      'Engineers at a mid-size infra startup walk through how tracing-first debugging cut incident response time by half.',
    trending: false,
  },
  {
    id: 'a3',
    title: 'Seed-stage funding shifts toward vertical AI agents',
    category: 'Startups',
    tags: ['funding', 'agents'],
    source: 'Capital Desk',
    publishedAt: '2026-09-15T21:05:00Z',
    readingTimeMin: 4,
    summary:
      'Investors are increasingly favoring narrow, workflow-specific agents over general-purpose assistants at the earliest funding stage.',
    trending: false,
  },
  {
    id: 'a4',
    title: 'New benchmark exposes weaknesses in long-context retrieval',
    category: 'Research',
    tags: ['benchmarks', 'evaluation'],
    source: 'arXiv Digest',
    publishedAt: '2026-09-15T18:30:00Z',
    readingTimeMin: 7,
    summary:
      'Researchers introduce a benchmark showing that even top models degrade sharply when relevant facts are buried in long documents.',
    trending: true,
  },
  {
    id: 'a5',
    title: 'Battery chemistry breakthrough could cut EV charging time in half',
    category: 'Technology',
    tags: ['hardware', 'energy'],
    source: 'Hard Tech Weekly',
    publishedAt: '2026-09-15T14:00:00Z',
    readingTimeMin: 5,
    summary:
      'A materials science team demonstrates a solid-state cell design that maintains capacity after thousands of fast-charge cycles.',
    trending: false,
  },
  {
    id: 'a6',
    title: 'Why type systems are creeping back into scripting languages',
    category: 'Programming',
    tags: ['languages', 'tooling'],
    source: 'Dev Signal',
    publishedAt: '2026-09-15T11:20:00Z',
    readingTimeMin: 8,
    summary:
      'Gradual typing adoption is accelerating across dynamic languages as teams look for compile-time guarantees without a full rewrite.',
    trending: false,
  },
  {
    id: 'a7',
    title: 'Regulators outline draft rules for AI-generated media labeling',
    category: 'AI',
    tags: ['policy', 'regulation'],
    source: 'Policy Wire',
    publishedAt: '2026-09-15T09:00:00Z',
    readingTimeMin: 6,
    summary:
      'A proposed framework would require visible and embedded labeling for synthetic media distributed on major platforms.',
    trending: false,
  },
  {
    id: 'a8',
    title: 'A founder\'s postmortem on shutting down after 18 months',
    category: 'Startups',
    tags: ['postmortem'],
    source: 'Capital Desk',
    publishedAt: '2026-09-14T20:45:00Z',
    readingTimeMin: 10,
    summary:
      'Lessons on distribution, runway, and why the team\'s technical strength didn\'t translate into a defensible product.',
    trending: false,
  },
  {
    id: 'a9',
    title: 'Widely used logging library patches critical remote-execution flaw',
    category: 'Cybersecurity',
    tags: ['vulnerability', 'patch'],
    source: 'Sec Wire',
    publishedAt: '2026-09-16T08:10:00Z',
    readingTimeMin: 5,
    summary:
      'Maintainers urge immediate upgrades after researchers disclosed a flaw allowing remote code execution through crafted log input.',
    trending: true,
  },
]

export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const timestamp = new Date(isoString).getTime()
  if (Number.isNaN(timestamp)) return ''
  const diffMs = Date.now() - timestamp
  if (diffMs < 0) return 'just now'
  const diffHrs = Math.round(diffMs / (1000 * 60 * 60))
  if (diffHrs < 1) return 'just now'
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.round(diffHrs / 24)
  return `${diffDays}d ago`
}
