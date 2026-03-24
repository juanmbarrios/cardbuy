# Automation System

This directory contains automation state and configuration for the project.

## Files

### `state.json`
Tracks the state of automation runs:
- `version`: Schema version
- `project_fingerprint`: Fingerprint of the current `docs/project.md`
- `generated_at`: Timestamp of the last successful generation
- `issues`: Maps generated task IDs to GitHub issue metadata
- `labels`: Area labels managed by the automation

## How It Works

The automation system is triggered by:
1. **Manual trigger**: GitHub Actions "workflow_dispatch" (click "Run workflow" on Actions tab)
2. **Push to docs/project.md**: Any changes to `docs/project.md` trigger the workflow

### Workflow Steps

1. **Checkout**: Gets the latest code
2. **Setup Python**: Prepares Python 3.11 environment
3. **Run Bootstrap Script**: Executes `scripts/bootstrap_project.py`

### Bootstrap Script Responsibilities

- Reads `docs/project.md` as structured Markdown
- Extracts `Modules`, `Dependencies`, `Order of construction`, `Priorities`, and `Proposed tasks`
- Creates or maintains area labels using the exact module names from the project document
- Generates one structured issue per proposed task with:
  - numbered title
  - automatic task ID
  - inferred area
  - inferred priority
  - simple dependencies
  - acceptance criteria
- Keeps `docs/rules/` aligned with the project areas
- Updates `state.json` to avoid duplicate issue creation

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
- Duplicate issues are not created when task IDs already exist in `state.json`
- Existing issues are updated instead of recreated when the same task ID is regenerated
- Area labels are created only when missing
- Base area rule files are created only when missing

## Markdown Source Structure

The automation does not depend on JSON inside `docs/project.md`.

It reads normal Markdown sections such as:
- `Modules`
- `Dependencies`
- `Order of construction`
- `Priorities`
- `Proposed tasks`

If some sections are missing, the script falls back to defaults instead of failing.
