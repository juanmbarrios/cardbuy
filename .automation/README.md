# Automation System

This directory contains automation state and configuration for the project.

## Files

### `state.json`
Tracks the state of automation runs:
- `version`: Schema version
- `created_issues`: Maps task IDs to GitHub issue numbers to prevent duplicate creation
- `created_labels`: List of created labels
- `last_run`: Timestamp of the last successful automation run

## How It Works

The automation system is triggered by:
1. **Manual trigger**: GitHub Actions "workflow_dispatch" (click "Run workflow" on Actions tab)
2. **Push to docs/project.md**: Any changes to `docs/project.md` trigger the workflow

### Workflow Steps

1. **Checkout**: Gets the latest code
2. **Setup Python**: Prepares Python 3.11 environment
3. **Run Bootstrap Script**: Executes `scripts/bootstrap_project.py`

### Bootstrap Script Responsibilities

- Reads `docs/project.md` and extracts the Automation manifest (JSON block)
- **Creates Labels**: Generates labels for:
  - Areas: `area/foundation`, `area/catalog`, etc.
  - Priorities: `priority/P0`, `priority/P1`, `priority/P2`
  - Sizes: `size/S`, `size/M`, `size/L`, `size/XL`
- **Creates Issues**: Generates GitHub issues for each task with:
  - Task ID, area, priority, size in description
  - Acceptance criteria as checkboxes
  - Subtasks as checkboxes
  - Dependencies documented
- **Creates Rules Directory**: Generates `docs/rules/` with:
  - `NAMING_CONVENTIONS.md`
  - `COMMIT_CONVENTIONS.md`
  - `CODE_REVIEW_GUIDELINES.md`
  - `API_STANDARDS.md`
- **Tracks State**: Updates `state.json` to avoid duplicate issues

## Requirements

- Python 3.11+ (provided by GitHub Actions)
- `GITHUB_TOKEN` (automatic in GitHub Actions)
- Write permissions on the repository (configured in workflow)

## Manual Execution

To run the bootstrap script locally:

```bash
export GITHUB_TOKEN=your_token_here
export GITHUB_REPOSITORY=username/repo
python scripts/bootstrap_project.py
```

## Idempotency

The system is idempotent:
- Duplicate issues are not created (tracked in `state.json`)
- Labels are created only if they don't exist
- Rules are created only if they don't exist

## Manifest Structure

The Automation manifest in `docs/project.md` contains:
- `schema_version`: Version of the manifest format
- `project_name`: Name of the project
- `areas`: Array of work areas with `id` and `name`
- `tasks`: Array of tasks with:
  - `id`: Task identifier (T001, T002, etc.)
  - `title`: Task title
  - `area`: Area ID
  - `priority`: Priority level (P0, P1, P2)
  - `size`: Task size (S, M, L, XL)
  - `depends_on`: Array of task IDs this depends on
  - `description`: Task description
  - `acceptance`: Array of acceptance criteria
  - `subtasks`: Array of subtasks
