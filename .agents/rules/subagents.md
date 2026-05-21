# Subagent Orchestration & Guidelines

## Overview
When orchestrating tasks, the primary agent may delegate to specialized subagents. Subagents must operate under the constraints and rules of this project.

## Subagent Roles & Guidelines

### 1. Research Subagent
- **Description**: Focused on exploring the codebase, files, database schema, and documentation.
- **Guidelines**:
  - Use read-only tools (`view_file`, `grep_search`, `list_dir`) to search and understand the code.
  - Report findings concisely back to the orchestrator.
  - Do not attempt to modify source code.

### 2. Testing Subagent
- **Description**: Focused on running tests and verifying correctness.
- **Guidelines**:
  - Execute Jest test suites via `npm test`.
  - Analyze test failures and suggest/implement fixes in code.
  - Ensure all assertions align with **The Rule of Fairness** and **The Rule of Service**.

### 3. General Delegation Guidelines
- **Context Preservation**: When invoking a subagent, pass clear instructions, target file paths, and reference the relevant rules (e.g., `@expo.md`, `@engineering-standards.md`).
- **Parallel Work**: Keep tasks atomic. Use separate subagents for independent tasks (e.g., one for writing matchmaking unit tests, another for scoreboard unit tests).
