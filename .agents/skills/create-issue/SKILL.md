---
name: create-issue
description: Create a GitHub issue for the repository.
---

### Prerequisites
- Ensure `gh` is installed and authenticated (`gh auth status`)
- Default repo: `abdullah-saud12/reviewer-agent`

### Steps

1. **Understand the request**
   - Determine issue type: bug, feature, refactor, docs, performance, etc.
   - Pick the right label(s) from the list below

2. **Check for duplicates**
   ```bash
   gh issue list --repo abdullah-saud12/reviewer-agent --search "keywords"
   ```
   If a similar issue exists, inform the user and don't create a duplicate.

3. **Prepare the issue**
   - Title format (conventional):
     - Bug: `fix: [area] brief description`
     - Feature: `feat: [area] brief description`
     - Refactor: `refactor: [area] what needs refactoring`
   - Body structure:
     - **Description** — what and why
     - **Expected Behavior** / **Current Behavior** / **Steps to Reproduce** (bugs)
     - **Proposed Solution** (if applicable)

4. **Create the issue**
   ```bash
   gh issue create \
     --repo abdullah-saud12/reviewer-agent \
     --title "TITLE" \
     --body "BODY" \
     --label "LABEL"
   ```
   Common labels: `bug`, `enhancement`, `refactor`, `documentation`, `performance`, `testing`

5. **Confirm and share the URL** with the user.
