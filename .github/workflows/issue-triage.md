---
name: Issue Triage
emoji: 🔍
description: When a new issue is opened, classify it, label it, add an eyes reaction, and post a friendly triage comment.
engine: codex

# Trigger - fires once per newly opened issue; eyes reaction added on activation
# workflow_dispatch satisfies gh-aw's requirement that every workflow be manually runnable
on:
  issues:
    types: [opened]
  workflow_dispatch:
  reaction: eyes

# Permissions - agent job stays read-only; label/comment writes go through safe-outputs
permissions:
  contents: read
  issues: read

# Outputs - exactly one label and one comment per issue
safe-outputs:
  add-labels:
    allowed: [bug, enhancement, question, documentation]
    max: 1
  add-comment:
    max: 1

network: defaults
---

# issue-triage

## Task

You are triaging issue #${{ github.event.issue.number }}, opened by @${{ github.actor }}.

Title: ${{ github.event.issue.title }}

Content:
${{ steps.sanitized.outputs.text }}

1. Classify the issue as exactly one of: `bug`, `enhancement`, `question`, `documentation`.
2. Add the matching label via `add-labels`.
3. Post exactly one comment via `add-comment` that:
   - Greets the author by username (`@${{ github.actor }}`).
   - Summarizes your understanding of the issue in one or two sentences.
   - Only if it is a bug report missing reproduction steps, expected behavior, and/or environment details, politely asks for whichever of those are missing — skip this ask entirely for non-bugs or complete bug reports.

Keep the comment short, friendly, and helpful. Do not close or edit the issue, and do not add labels or comments beyond the ones described above.

## Safe Outputs

- Use `add-labels` exactly once, with exactly one of the four allowed labels.
- Use `add-comment` exactly once, as described above.
