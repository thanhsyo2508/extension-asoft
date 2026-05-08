# 📌 Git Commit Convention for Human & AI Agents

> Version: 1.0
> Purpose: Standardize commit history for developers, CI/CD pipelines, and autonomous AI coding agents.

---

# 🎯 Goals

This convention exists to:

* Keep commit history clean and readable.
* Support automated changelog generation.
* Enable semantic versioning.
* Improve CI/CD automation.
* Allow AI agents to understand project evolution.
* Make issue → implementation → release traceable.

---

# 🧱 Commit Structure

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

# ✅ Examples

## Simple commit

```text
feat(auth): add google oauth login
```

---

## Commit with body

```text
fix(api): prevent null pointer on user profile

Handle missing profile data before serialization
to avoid runtime crashes in production.
```

---

## Commit with breaking change

```text
feat(db): migrate user schema to uuid

Replace integer primary keys with UUID identifiers
for distributed system compatibility.

BREAKING CHANGE: user.id type changed from int to uuid
```

---

## Commit linked to issue

```text
fix(queue): resolve deadlock in task worker

Fixes #142
```

---

# 🔑 Commit Types

| Type     | Purpose                                      |
| -------- | -------------------------------------------- |
| feat     | Add new feature                              |
| fix      | Bug fix                                      |
| docs     | Documentation changes                        |
| style    | Formatting only (lint, spacing, indentation) |
| refactor | Refactor without changing behavior           |
| perf     | Performance improvement                      |
| test     | Add or update tests                          |
| build    | Build system or dependency changes           |
| ci       | CI/CD configuration changes                  |
| chore    | Maintenance tasks                            |
| revert   | Revert previous commit                       |
| security | Security-related changes                     |
| deps     | Dependency updates                           |

---

# 📌 Scope Convention

Scope defines the affected module or domain.

## Recommended scopes

| Scope  | Description            |
| ------ | ---------------------- |
| api    | Backend API            |
| auth   | Authentication         |
| db     | Database               |
| ui     | Frontend/UI            |
| core   | Core business logic    |
| infra  | Infrastructure         |
| ci     | CI/CD                  |
| docs   | Documentation          |
| queue  | Background jobs/queues |
| ai     | AI/ML systems          |
| vision | Computer vision        |
| iot    | Embedded/IoT systems   |

---

# ⚠️ Description Rules

## Requirements

* Use imperative mood.
* Keep under 72 characters.
* Do not capitalize first letter.
* Do not end with a period (`.`).

---

## Good Examples

```text
feat(api): add export endpoint
fix(auth): handle expired jwt token
refactor(core): simplify device parser
```

---

## Bad Examples

```text
feat(api): Added export endpoint.
fix(auth): JWT token expired
```

---

# 🧠 Body Rules

Body should explain:

* WHY the change exists
* Technical reasoning
* Side effects
* Constraints
* Tradeoffs

Avoid repeating the title.

---

## Good Example

```text
perf(cache): reduce redis lookup frequency

User profile queries caused excessive Redis traffic
during dashboard refresh.

Introduce 5-second local cache layer to reduce load.
```

---

# 🚨 Footer Rules

## Supported footers

### Breaking changes

```text
BREAKING CHANGE: remove legacy mqtt protocol support
```

---

### Issue references

```text
Closes #142
Fixes #88
Refs #201
```

---

# 🤖 AI Agent Metadata (Recommended)

For autonomous coding systems, include metadata when useful.

## Example

```text
feat(vision): improve pcb classification confidence

Context:
- inconsistent flash reflection
- false positives on black pcb

Solution:
- add gemma4 validation layer
- compare historical inference results

Impact:
- reduce false positive rate

Refs: ISSUE-142
AI-Agent: claude-code
Reviewed-by: thanh
```

---

# 🌱 Branch Naming Convention

## Feature branch

```text
feat/google-oauth-login
feat/device-batch-import
```

---

## Fix branch

```text
fix/dashboard-memory-leak
fix/mqtt-reconnect-loop
```

---

## Chore branch

```text
chore/update-eslint
chore/cleanup-docker
```

---

# 🚀 Workflow

1. Pull latest changes.
2. Create branch using naming convention.
3. Implement feature/fix.
4. Run lint and tests.
5. Create commit using this standard.
6. Open Pull Request.
7. Request review.
8. Merge via squash or rebase strategy.

---

# ✅ Pre-Commit Checklist

* [ ] Commit message follows convention
* [ ] No unnecessary files committed
* [ ] Lint passed
* [ ] Tests passed
* [ ] Secrets/tokens removed
* [ ] Build successful

---

# 🔒 Protected Rules

The following files or directories MUST NOT be committed:

```text
node_modules/
dist/
build/
coverage/
.env
*.log
*.tmp
```

---

# 🛠 Recommended Tooling

## Commit validation

* commitlint
* husky

---

## Example commitlint config

```js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

---

## Example husky hook

```bash
npx commitlint --edit "$1"
```

---

# 📦 Semantic Versioning Mapping

| Commit Type     | Version Impact |
| --------------- | -------------- |
| feat            | MINOR          |
| fix             | PATCH          |
| BREAKING CHANGE | MAJOR          |

---

# 🧭 Recommended Merge Strategy

## Preferred

* Squash and merge
* Rebase and merge

## Avoid

* Random merge commits
* Unstructured commit history

---

# 📚 Philosophy

A commit should answer:

1. What changed?
2. Why did it change?
3. What system is affected?
4. Is it safe?
5. Can another developer or AI understand it later?

Good commits are:

* searchable
* automatable
* reviewable
* reversible
* machine-readable

---

# ✅ Final Notes

This convention is designed for:

* Human developers
* AI coding agents
* CI/CD systems
* Changelog automation
* Large-scale projects
* Open-source repositories
* Embedded/IoT systems
* ML/AI pipelines

Consistency is more important than perfection.
Follow the convention strictly once adopted.
