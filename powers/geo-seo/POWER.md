---
name: "geo-seo"
displayName: "GEO-SEO Optimizer"
description: "Optimize websites for AI-powered search engines (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) while maintaining traditional SEO foundations. Runs full GEO audits, citability scoring, AI crawler analysis, llms.txt generation, brand mention scanning, schema markup, and client-ready report generation via Claude Code slash commands."
keywords: ["geo", "seo", "ai-search", "citability", "llms.txt", "schema", "brand-mentions", "audit"]
author: "zubair-trabzada"
---

# GEO-SEO Optimizer

## Overview

GEO (Generative Engine Optimization) is the emerging discipline of optimizing websites for AI-powered search engines — ChatGPT, Claude, Perplexity, Gemini, and Google AI Overviews. This power installs the `geo-seo-claude` Claude Code skill, giving you a suite of `/geo` slash commands that run parallel audits, score AI citability, analyze crawler access, generate llms.txt files, scan brand mentions, and produce client-ready PDF reports.

AI-referred traffic is growing at +527% year-over-year and converts 4.4x better than organic search. Traditional SEO alone is no longer sufficient — this tool optimizes for where traffic is going, not where it was.

## Onboarding

### Prerequisites

- Python 3.8+
- Claude Code CLI installed and authenticated
- Git
- Optional: Playwright (for screenshot-based analysis)

### Installation

**macOS / Linux (one command):**
```bash
curl -fsSL https://raw.githubusercontent.com/zubair-trabzada/geo-seo-claude/main/install.sh | bash
```

**Windows (Git Bash only — not PowerShell or CMD):**
```bash
curl -fsSL https://raw.githubusercontent.com/zubair-trabzada/geo-seo-claude/main/install-win.sh | bash
```

**Manual install:**
```bash
git clone https://github.com/zubair-trabzada/geo-seo-claude.git
cd geo-seo-claude
./install.sh
```

### Verification

After install, open Claude Code and run:
```
/geo quick https://example.com
```
You should see a 60-second GEO visibility snapshot inline.

### Uninstall

```bash
./uninstall.sh
# or manually:
rm -rf ~/.claude/skills/geo ~/.claude/skills/geo-* ~/.claude/agents/geo-*.md
```

> Note: `~/.geo-prospects/` (CRM data) is NOT removed by the uninstaller. Delete it manually if needed.

---

## Commands

| Command | What It Does |
|---------|-------------|
| `/geo audit <url>` | Full GEO + SEO audit with 5 parallel subagents |
| `/geo quick <url>` | 60-second GEO visibility snapshot (no output file) |
| `/geo citability <url>` | Score content for AI citation readiness |
| `/geo crawlers <url>` | Check AI crawler access via robots.txt |
| `/geo llmstxt <url>` | Analyze or generate llms.txt |
| `/geo brands <url>` | Scan brand mentions across AI-cited platforms |
| `/geo platforms <url>` | Platform-specific optimization (ChatGPT, Perplexity, Google AIO) |
| `/geo schema <url>` | Structured data detection, validation & generation |
| `/geo technical <url>` | Technical SEO audit |
| `/geo content <url>` | Content quality & E-E-A-T assessment |
| `/geo report <url>` | Generate client-ready markdown GEO report |
| `/geo report-pdf <url>` | Generate professional PDF report with charts |
| `/geo prospect <cmd>` | CRM-lite: manage prospects through sales pipeline |
| `/geo proposal <domain>` | Auto-generate client proposal from audit data |
| `/geo compare <domain>` | Monthly delta report showing score improvements |

---

## Common Workflows

### Full Site Audit

```
/geo audit https://yoursite.com
```

Runs 5 parallel subagents covering AI visibility, platform analysis, technical SEO, content quality, and schema markup. Outputs `GEO-AUDIT-REPORT.md` with a composite GEO Score (0–100) and prioritized action plan.

### Quick Visibility Check

```
/geo quick https://yoursite.com
```

60-second snapshot — no file written, results inline. Good for a fast sanity check before a deeper audit.

### Generate llms.txt

```
/geo llmstxt https://yoursite.com
```

Analyzes your site structure and generates a ready-to-deploy `llms.txt` file that helps AI crawlers understand your content hierarchy.

### Client Deliverable (PDF)

```
# Step 1: run the full audit first
/geo audit https://client.com

# Step 2: generate the PDF
/geo report-pdf https://client.com
```

Produces `GEO-REPORT.pdf` with score gauges, bar charts, platform readiness dashboard, crawler access table, and prioritized action plan.

### Prospect Pipeline

```
/geo prospect add https://client.com
/geo proposal client.com
/geo compare client.com
```

Manages a lightweight CRM at `~/.geo-prospects/` — add prospects, generate proposals, and track monthly score improvements.

---

## Scoring Methodology

| Category | Weight |
|----------|--------|
| AI Citability & Visibility | 25% |
| Brand Authority Signals | 20% |
| Content Quality & E-E-A-T | 20% |
| Technical Foundations | 15% |
| Structured Data | 10% |
| Platform Optimization | 10% |

---

## Output Files

| Command | Output |
|---------|--------|
| `/geo audit` | `GEO-AUDIT-REPORT.md` |
| `/geo citability` | `GEO-CITABILITY-SCORE.md` |
| `/geo crawlers` | `GEO-CRAWLER-ACCESS.md` |
| `/geo llmstxt` | `llms.txt` |
| `/geo brands` | `GEO-BRAND-MENTIONS.md` |
| `/geo platforms` | `GEO-PLATFORM-OPTIMIZATION.md` |
| `/geo schema` | `GEO-SCHEMA-REPORT.md` + JSON-LD files |
| `/geo technical` | `GEO-TECHNICAL-AUDIT.md` |
| `/geo content` | `GEO-CONTENT-ANALYSIS.md` |
| `/geo report` | `GEO-CLIENT-REPORT.md` |
| `/geo report-pdf` | `GEO-REPORT.pdf` |
| `/geo quick` | Inline only |

---

## Best Practices

- Always run `/geo audit` before `/geo report-pdf` — the PDF generator needs the audit data
- Use `/geo quick` first to spot obvious issues before committing to a full audit
- For e-commerce sites, prioritize `/geo schema` — Product + Review schema has the highest AI citation impact
- For local businesses, run `/geo technical` and `/geo brands` — LocalBusiness schema and Google Business Profile mentions matter most
- Optimal AI-cited content passages are 134–167 words, self-contained, fact-rich, and directly answer a question
- Brand mentions on Reddit, YouTube, Wikipedia, and LinkedIn correlate 3x more strongly with AI visibility than backlinks

## Troubleshooting

### `/geo` commands not found after install

The install script copies skills to `~/.claude/skills/`. Restart Claude Code after installing.

### Python errors on first run

Install dependencies manually:
```bash
cd geo-seo-claude
pip install -r requirements.txt
```

### PDF generation fails

ReportLab is required for PDF output:
```bash
pip install reportlab
```

### Fetch errors / timeouts

The tool respects robots.txt and applies a 1-second delay between requests. If a site blocks crawlers, `/geo crawlers <url>` will report which bots are blocked — this is expected behavior, not a bug.

### Windows: "command not found" for bash scripts

Use Git Bash, not PowerShell or CMD. Right-click the folder → "Open Git Bash here".

---

**Source:** [github.com/zubair-trabzada/geo-seo-claude](https://github.com/zubair-trabzada/geo-seo-claude)
**Type:** Claude Code Skill (Knowledge Base Power — no MCP server)
