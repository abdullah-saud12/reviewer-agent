---
name: create-pull-request
description: Create the pull request.
---

- Create a pull request. Do not follow the template. Keep the pull request description concise and to the point.
- Run related tests for the changes before opening or updating the PR, and include the exact test commands and outcomes in the PR description.
- Ensure all commits in the PR follow the conventional commits format (see create-commit skill for details).
- The PR title should follow conventional commits format if it represents a single logical change.
- **Strip CI tags from PR title**: Remove `[ci run_smart]`, `[ci skip]`, `[ci run]`, `[ci fasttrack]` from the PR title. These tags belong in commit messages only, not PR titles.
  - Commit: `feat: add user filter [ci run_smart]`
  - PR title: `feat: add user filter`
- Reference the issue in the pull request description using one of:
  - `Closes #<issue-number>` or `Fixes #<issue-number>` (will auto-close)
  - `Addresses #<issue-number>` (does not auto-close)
- If `gh pr create` warns about uncommitted changes, call that out explicitly and confirm those changes are unrelated to the PR (or commit them if they are relevant).

### Worktree Return

If currently in a worktree (check with `pwd` and `git worktree list`):
- Ask if user wants to return to main directory
- If yes, offer to switch back: `cd [main-repo-path]`
- Confirm switch with current directory and git status
