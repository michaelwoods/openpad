# Contributing to this Project

This project uses a combination of human and AI (OpenCode) contributors. To maintain high code quality and consistency, all contributors must adhere to the following standards.

> **Note:** For detailed AI agent instructions (build commands, testing, coding standards), see [AGENTS.md](../AGENTS.md).

## 🤖 AI Contributor Guidelines (OpenCode)

When implementing fixes or features automatically:

- **Branching**: Always create a branch.
- **Scope**: Focus on ONE issue per Pull Request. Do not bundle unrelated changes.
- **Testing**: If the project contains a test suite, ensure all tests pass before submitting a PR. Add new tests for any new logic introduced.
- **Documentation**: Update relevant inline comments and README sections if the public API or configuration changes.
- **Human Review**: All AI-generated PRs require human review before merging. Ensure branch protection rules are enabled on the main branch.

## 🛠️ Engineering Standards

- **Style**: Follow standard linting rules (e.g., ESLint for JS/TS, PEP8 for Python).
- **Architecture**:
  - Prefer functional, stateless logic where possible.
  - Ensure robust error handling for all asynchronous or I/O operations (especially IoT/Network calls).
  - Use descriptive variable and function names; avoid magic numbers.
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `fix: resolve memory leak in sensor loop`).

## 📋 The "Ready" Workflow

An issue is considered **ready-to-start** only if it contains:

1. A clear "User Story" or technical objective.
2. For bugs: Steps to reproduce and expected vs. actual behavior.
3. For features: A list of specific requirements or UI/UX constraints.

## 🔍 Pull Request Reviews

All PRs (human or AI) require at least one approval. The AI reviewer will check for:

- Logic errors and edge cases.
- Adherence to the DRY (Don't Repeat Yourself) principle.
- Security vulnerabilities (no hardcoded secrets).
