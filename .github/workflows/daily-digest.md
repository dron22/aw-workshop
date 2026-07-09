---
name: Daily Digest
emoji: 📋
description: Every weekday morning, post an issue summarizing all open issues and PRs, grouped by label.
engine: codex

# Trigger - fuzzy schedule; compiler adds workflow_dispatch automatically for manual runs
on:
  schedule: daily on weekdays

# Permissions - agent job stays read-only; the issue is created via safe-outputs
permissions:
  contents: read
  issues: read
  pull-requests: read

# Pre-fetch everything with gh + jq so the agent only reads compact JSON
steps:
  - name: Fetch open issues and PRs
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    run: |
      mkdir -p /tmp/gh-aw/data
      date -u +%Y-%m-%d > /tmp/gh-aw/data/today.txt

      gh issue list --repo "${{ github.repository }}" --state open --limit 200 \
        --json number,title,url,labels,author,createdAt \
        > /tmp/gh-aw/data/issues-raw.json
      gh pr list --repo "${{ github.repository }}" --state open --limit 200 \
        --json number,title,url,labels,author,createdAt \
        > /tmp/gh-aw/data/prs-raw.json

      compact='[.[] | {
        number, title, url,
        author: .author.login,
        labels: [.labels[].name],
        createdAt,
        daysOpen: (((now - (.createdAt | fromdateiso8601)) / 86400) | floor)
      }]'
      jq "$compact" /tmp/gh-aw/data/issues-raw.json > /tmp/gh-aw/data/issues.json
      jq "$compact" /tmp/gh-aw/data/prs-raw.json > /tmp/gh-aw/data/prs.json

# Outputs - one digest issue per weekday; supersede the previous one
safe-outputs:
  mentions: false
  create-issue:
    max: 1
    labels: [digest]
    group-by-day: true
    close-older-issues: true

network: defaults
---

# daily-digest

## Task

Read the pre-fetched data instead of calling the GitHub API directly:

- `/tmp/gh-aw/data/today.txt` — today's date (UTC, `YYYY-MM-DD`)
- `/tmp/gh-aw/data/issues.json` — open issues: `number`, `title`, `url`, `author`, `labels`, `createdAt`, `daysOpen`
- `/tmp/gh-aw/data/prs.json` — open pull requests, same shape

Create exactly one issue via the `create-issue` safe output:

- **Title**: `Daily Digest – <date from today.txt>`
- **Body**:
  1. Start with one paragraph summarizing the overall state of the repo — roughly how many issues vs. PRs are open, whether anything looks stale or urgent, and general momentum.
  2. Group every issue and PR by label, using each label name as a `### <label>` heading. Items with no labels go under `### Untriaged`. An item with multiple labels appears once under each of its labels.
  3. Within a section, list issues and PRs together, newest first, one line each:
     `- [#<number>] <title> — @<author>, open <daysOpen> day(s)`, linking `#<number>` to `<url>`.

If both `issues.json` and `prs.json` are empty, call `noop` explaining the repo has no open issues or PRs instead of creating an empty digest.

## Safe Outputs

- Use `create-issue` for the digest exactly as described above.
- Use `noop` with a short reason when there is nothing to report.
