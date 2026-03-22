#!/usr/bin/env python3
"""
Bootstrap Project Automation Script

Reads docs/project.md, extracts the Automation manifest, and:
- Creates labels in GitHub
- Creates issues from tasks
- Sets up docs/rules/ directory structure
- Creates .automation/state.json to track automation state
"""

import json
import os
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# Configuration
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_REPOSITORY = os.environ.get("GITHUB_REPOSITORY", "")
PROJECT_FILE = "docs/project.md"
STATE_FILE = ".automation/state.json"
RULES_DIR = "docs/rules"

# GitHub API base URL
GITHUB_API = "https://api.github.com"


def log(msg: str, level: str = "INFO"):
    """Simple logging function."""
    print(f"[{level}] {msg}")


def read_project_md() -> str:
    """Read the project.md file."""
    try:
        with open(PROJECT_FILE, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        log(f"File {PROJECT_FILE} not found", "ERROR")
        sys.exit(1)
    except Exception as e:
        log(f"Error reading {PROJECT_FILE}: {e}", "ERROR")
        sys.exit(1)


def extract_automation_manifest(content: str) -> dict:
    """Extract the JSON automation manifest from the markdown."""
    # Find the code block with the JSON
    pattern = r"```json\s*(\{[\s\S]*?\})\s*```"
    match = re.search(pattern, content)
    
    if not match:
        log("No JSON automation manifest found in docs/project.md", "ERROR")
        sys.exit(1)
    
    json_str = match.group(1)
    try:
        manifest = json.loads(json_str)
        return manifest
    except json.JSONDecodeError as e:
        log(f"Error parsing JSON manifest: {e}", "ERROR")
        sys.exit(1)


def github_api_call(method: str, endpoint: str, data: dict = None) -> dict:
    """Make a GitHub API call."""
    if not GITHUB_TOKEN or not GITHUB_REPOSITORY:
        log("GITHUB_TOKEN or GITHUB_REPOSITORY not set", "WARNING")
        return {}
    
    url = f"{GITHUB_API}/repos/{GITHUB_REPOSITORY}{endpoint}"
    
    try:
        headers = {
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        
        body = None
        if data:
            body = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        
        req = Request(url, data=body, headers=headers, method=method)
        with urlopen(req) as response:
            response_data = response.read().decode("utf-8")
            return json.loads(response_data) if response_data else {}
    
    except HTTPError as e:
        response_body = e.read().decode("utf-8")
        log(f"GitHub API error {e.code}: {response_body}", "WARNING")
        return {}
    except URLError as e:
        log(f"Network error: {e}", "WARNING")
        return {}
    except Exception as e:
        log(f"API call error: {e}", "WARNING")
        return {}


def get_existing_labels() -> set:
    """Get the set of existing labels in the repository."""
    labels = set()
    try:
        result = github_api_call("GET", "/labels?per_page=100")
        if isinstance(result, list):
            for label in result:
                labels.add(label.get("name"))
    except Exception as e:
        log(f"Error fetching labels: {e}", "WARNING")
    return labels


def create_label(name: str, color: str, description: str = "") -> bool:
    """Create a label in the repository."""
    data = {
        "name": name,
        "color": color,
        "description": description,
    }
    result = github_api_call("POST", "/labels", data)
    if "url" in result:
        log(f"Created label: {name}")
        return True
    return False


def create_labels_from_manifest(manifest: dict):
    """Create labels for areas and priorities."""
    existing_labels = get_existing_labels()
    
    # Create area labels
    colors_area = {
        "foundation": "FF6B6B",
        "catalog": "4ECDC4",
        "search": "45B7D1",
        "marketplace": "FFA07A",
        "trust": "98D8C8",
        "seller": "F7DC6F",
        "seo": "BB8FCE",
        "community": "85C1E9",
        "admin": "F8B195",
    }
    
    for area in manifest.get("areas", []):
        area_id = area.get("id", "")
        area_name = area.get("name", "")
        color = colors_area.get(area_id, "CCCCCC")
        
        label_name = f"area/{area_id}"
        if label_name not in existing_labels:
            create_label(label_name, color, f"Area: {area_name}")
    
    # Create priority labels
    colors_priority = {
        "P0": "FF0000",
        "P1": "FFA500",
        "P2": "FFFF00",
    }
    
    for priority, color in colors_priority.items():
        label_name = f"priority/{priority}"
        if label_name not in existing_labels:
            create_label(label_name, color, f"Priority: {priority}")
    
    # Create size labels
    colors_size = {
        "S": "90EE90",
        "M": "87CEEB",
        "L": "FF69B4",
        "XL": "FF1493",
    }
    
    for size, color in colors_size.items():
        label_name = f"size/{size}"
        if label_name not in existing_labels:
            create_label(label_name, color, f"Size: {size}")


def load_state() -> dict:
    """Load the automation state file if it exists."""
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            log(f"Error loading state file: {e}", "WARNING")
    
    return {
        "version": "1.0",
        "created_issues": {},
        "created_labels": set(),
        "last_run": "",
    }


def save_state(state: dict):
    """Save the automation state file."""
    try:
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        # Convert sets to lists for JSON serialization
        state_to_save = state.copy()
        if isinstance(state_to_save.get("created_labels"), set):
            state_to_save["created_labels"] = list(state_to_save["created_labels"])
        
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state_to_save, f, indent=2)
        log(f"State saved to {STATE_FILE}")
    except Exception as e:
        log(f"Error saving state file: {e}", "WARNING")


def get_existing_issues() -> dict:
    """Get existing issues indexed by title."""
    existing = {}
    try:
        # Fetch all open issues
        result = github_api_call("GET", "/issues?state=open&per_page=100")
        if isinstance(result, list):
            for issue in result:
                existing[issue.get("title")] = issue.get("number")
    except Exception as e:
        log(f"Error fetching issues: {e}", "WARNING")
    return existing


def create_issue(title: str, body: str, labels: list) -> int:
    """Create an issue in the repository."""
    data = {
        "title": title,
        "body": body,
        "labels": labels,
    }
    result = github_api_call("POST", "/issues", data)
    if "number" in result:
        issue_number = result["number"]
        log(f"Created issue #{issue_number}: {title}")
        return issue_number
    return None


def create_issues_from_manifest(manifest: dict, state: dict):
    """Create issues from the tasks in the manifest."""
    existing_issues = get_existing_issues()
    created_issues = state.get("created_issues", {})
    
    tasks = manifest.get("tasks", [])
    
    for task in tasks:
        task_id = task.get("id", "")
        title = task.get("title", "")
        area = task.get("area", "")
        priority = task.get("priority", "")
        size = task.get("size", "")
        description = task.get("description", "")
        acceptance = task.get("acceptance", [])
        subtasks = task.get("subtasks", [])
        depends_on = task.get("depends_on", [])
        
        # Check if issue already exists
        if task_id in created_issues or title in existing_issues:
            log(f"Issue {task_id} already exists, skipping")
            continue
        
        # Build the issue body
        body_parts = [
            f"**ID:** {task_id}",
            f"**Area:** {area}",
            f"**Priority:** {priority}",
            f"**Size:** {size}",
            "",
            "## Description",
            description,
        ]
        
        if depends_on:
            depends_text = ", ".join(depends_on)
            body_parts.append(f"\n## Depends On\n{depends_text}")
        
        if acceptance:
            body_parts.append("\n## Acceptance Criteria")
            for criterion in acceptance:
                body_parts.append(f"- [ ] {criterion}")
        
        if subtasks:
            body_parts.append("\n## Subtasks")
            for subtask in subtasks:
                body_parts.append(f"- [ ] {subtask}")
        
        body = "\n".join(body_parts)
        
        # Create labels for this issue
        issue_labels = [
            f"area/{area}",
            f"priority/{priority}",
            f"size/{size}",
        ]
        
        # Create the issue
        issue_num = create_issue(title, body, issue_labels)
        if issue_num:
            created_issues[task_id] = issue_num
    
    state["created_issues"] = created_issues
    return state


def create_rules_directory():
    """Create the docs/rules directory with base rule files."""
    os.makedirs(RULES_DIR, exist_ok=True)
    
    base_rules = {
        "NAMING_CONVENTIONS.md": """# Naming Conventions

## Modules and Services
- Use kebab-case for module names: `catalog-service`, `search-engine`, `payment-processor`
- Use PascalCase for class names: `CardService`, `OrderManager`, `PaymentGateway`
- Use camelCase for function names: `calculateShipping()`, `validateCard()`

## Database
- Use snake_case for table names: `users`, `card_listings`, `seller_ratings`
- Use snake_case for column names: `created_at`, `updated_at`, `seller_id`
- Use `id` for primary key column
- Use `{entity}_id` for foreign keys

## Files and Directories
- Use kebab-case for directory names: `api-routes`, `domain-models`, `database-migrations`
- Use kebab-case for file names: `card-repository.ts`, `search-service.py`
- Use PascalCase for React/Vue components: `CardDetail.tsx`, `SellerProfile.vue`

## Constants
- Use UPPER_SNAKE_CASE for constants: `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`, `API_TIMEOUT`

## Branches
- Use kebab-case with ticket ID: `T001-domain-model`, `T002-auth-setup`, `bugfix/payment-issue`
- Use prefixes: `feature/`, `bugfix/`, `hotfix/`, `refactor/`
""",
        "COMMIT_CONVENTIONS.md": """# Commit Message Conventions

## Format
```
{TYPE}({SCOPE}): {SUBJECT}

{BODY}

{FOOTER}
```

## Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Test additions or updates
- `chore`: Build process, dependency updates, etc.

## Scope
Reference the area or module affected: `catalog`, `search`, `payments`, `auth`, etc.

## Subject
- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Max 50 characters

## Examples
- `feat(catalog): add multi-language support for card names`
- `fix(search): resolve facet filter not applying correctly`
- `docs(payment): update escrow state machine diagram`
""",
        "CODE_REVIEW_GUIDELINES.md": """# Code Review Guidelines

## What to Check
1. **Correctness**: Does the code do what it's supposed to do?
2. **Performance**: Are there obvious performance issues?
3. **Security**: Are there security vulnerabilities?
4. **Testing**: Is there adequate test coverage?
5. **Documentation**: Are complex sections documented?
6. **Style**: Does it follow the project's conventions?

## Review Checklist
- [ ] Code follows naming conventions
- [ ] Logic is correct and handles edge cases
- [ ] No hardcoded values or secrets
- [ ] Error handling is appropriate
- [ ] Database queries are optimized
- [ ] Tests are present and meaningful
- [ ] Documentation is updated if needed
- [ ] No console logs left in production code

## Comment Guidelines
- Be respectful and constructive
- Ask questions instead of making demands
- Approve when you're confident about the changes
- Use "Request Changes" only for blocking issues
""",
        "API_STANDARDS.md": """# API Standards

## Endpoints
- Use RESTful conventions
- Use nouns for resources: `GET /api/cards`, `POST /api/orders`
- Use HTTP verbs correctly: GET, POST, PUT, DELETE, PATCH
- Version your API: `/api/v1/`

## Response Format
```json
{
  "success": true,
  "data": { /* resource or array */ },
  "error": null,
  "meta": { /* pagination, timestamps */ }
}
```

## Error Responses
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [ /* validation details */ ]
  }
}
```

## HTTP Status Codes
- 200 OK: Successful request
- 201 Created: Resource created
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required
- 403 Forbidden: Permission denied
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict (e.g., duplicate)
- 500 Internal Server Error: Server error
""",
    }
    
    for filename, content in base_rules.items():
        filepath = os.path.join(RULES_DIR, filename)
        if not os.path.exists(filepath):
            try:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                log(f"Created rule file: {filepath}")
            except Exception as e:
                log(f"Error creating rule file {filepath}: {e}", "WARNING")


def main():
    """Main execution function."""
    log("Starting project bootstrap automation")
    
    # Read and parse project.md
    log("Reading docs/project.md")
    content = read_project_md()
    
    log("Extracting automation manifest")
    manifest = extract_automation_manifest(content)
    
    log(f"Found {len(manifest.get('areas', []))} areas and {len(manifest.get('tasks', []))} tasks")
    
    # Create labels
    log("Creating GitHub labels")
    create_labels_from_manifest(manifest)
    
    # Load state
    state = load_state()
    
    # Create issues
    log("Creating GitHub issues from tasks")
    state = create_issues_from_manifest(manifest, state)
    
    # Create rules directory
    log(f"Creating rules directory: {RULES_DIR}")
    create_rules_directory()
    
    # Save state
    save_state(state)
    
    log("Project bootstrap automation completed successfully")


if __name__ == "__main__":
    main()
