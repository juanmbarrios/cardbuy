# Global

## Purpose
- Keep automation aligned with `docs/project.md` as the source of truth.
- Generate actionable, granular issues without depending on JSON manifests.
- Preserve stable issue identities across reruns through `.automation/state.json`.

## Backlog rules
- Create one issue per item in `Proposed tasks`.
- Use the exact area names defined in the `Modules` section as labels.
- Infer priority from `Priorities` when possible, otherwise use safe defaults.
- Infer simple dependencies from `Dependencies` and `Order of construction`.

## Quality rules
- Every issue must include a numbered title, task ID, area, dependencies, and acceptance criteria.
- Missing optional sections in the Markdown must not break issue generation.
- Normal Markdown variations such as bullets, numbering, and wrapped lines must be tolerated.
