---
name: create-commit
description: Create the commit.
---

- Review the staged diff and create a conventional commit message following this format:
  ```
  <type>(<scope>): <subject>

  <body>

  <footer>
  ```

- **Type** must be one of:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that don't affect code meaning (whitespace, formatting, missing semicolons, etc.)
  - `refactor`: Code change that neither fixes a bug nor adds a feature
  - `perf`: Performance improvements
  - `test`: Adding missing tests or correcting existing tests
  - `build`: Changes that affect the build system or external dependencies
  - `ci`: Changes to CI configuration files and scripts
  - `chore`: Other changes that don't modify src or test files
  - `revert`: Reverts a previous commit

- **Scope** (optional): A noun describing a section of the codebase surrounded by parentheses, e.g., `(parser)`, `(auth)`, `(api)`

- **Subject**: A brief description of the change:
  - Use imperative, present tense: "change" not "changed" nor "changes"
  - Don't capitalize the first letter
  - No period (.) at the end
  - Keep the subject line under 72 characters total

- **Body** (optional): Provide more detailed explanation if needed:
  - Use imperative, present tense
  - Include motivation for the change and contrast with previous behavior
  - Wrap at 72 characters

- **Footer** (optional): Reference issues, breaking changes, etc.
  - Breaking changes start with `BREAKING CHANGE:`
  - Reference issues with `Closes #123` or `Fixes #123`

- Example:
  ```
  feat(time_sheet): add customer filter

  Add customer_id parameter to time sheet queries to ensure proper
  data filtering. This prevents cross-customer data exposure and
  improves query performance.

  Closes #456
  ```

- Create the commit and push it to the branch. If any issues are found by lefthook (which runs commitlint), fix the commit message format and try again.
- Push only to the current branch's configured target. Do not change branch names, remotes, upstream tracking, or push destinations without explicit user instruction.
- If push is rejected (such as non-fast-forward), stop and ask the user how to proceed.

### Worktree Return

If currently in a worktree (check with `pwd` and `git worktree list`):
- Ask if user wants to return to main directory
- If yes, offer to switch back: `cd [main-repo-path]`
- Confirm switch with current directory and git status
