#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib import request

ROOT = Path(__file__).resolve().parents[1]
PROJECT_MD = ROOT / "docs" / "project.md"
STATE_FILE = ROOT / ".automation" / "state.json"

TOKEN = os.environ.get("GITHUB_TOKEN")
REPO = os.environ.get("GITHUB_REPOSITORY")

API = f"https://api.github.com/repos/{REPO}"


# -----------------------------
# UTILS
# -----------------------------

def api(method, path, payload=None):
    req = request.Request(
        f"{API}{path}",
        data=json.dumps(payload).encode() if payload else None,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json"
        },
        method=method
    )
    return json.loads(request.urlopen(req).read().decode())


def extract_section(md, title):
    match = re.search(rf"## {title}(.*?)(\n## |\Z)", md, re.DOTALL)
    return match.group(1).strip() if match else ""


# -----------------------------
# MARKDOWN → TASKS
# -----------------------------

def parse_tasks(md):
    tasks_raw = extract_section(md, "Proposed tasks")
    order_raw = extract_section(md, "Order of construction")

    if not tasks_raw:
        raise RuntimeError("No 'Proposed tasks' section found")

    lines = [l.strip("- ").strip() for l in tasks_raw.splitlines() if l.strip().startswith("-")]

    order_map = {}
    for i, line in enumerate(order_raw.splitlines()):
        clean = re.sub(r"^\d+\.\s*", "", line).strip()
        order_map[clean.lower()] = i + 1

    tasks = []

    for i, line in enumerate(lines):
        task_id = f"T{i+1:03}"

        # infer area
        area = infer_area(line)

        # infer priority
        priority = infer_priority(line)

        # infer order
        order = infer_order(line, order_map)

        tasks.append({
            "id": task_id,
            "title": line,
            "area": area,
            "priority": priority,
            "order": order,
            "depends_on": [],
            "description": line,
            "acceptance": ["Task completed successfully"],
            "subtasks": []
        })

    # ordenar por order
    tasks.sort(key=lambda t: t["order"])

    # dependencias lineales
    for i in range(1, len(tasks)):
        tasks[i]["depends_on"] = [tasks[i-1]["id"]]

    return tasks


def infer_area(text):
    text = text.lower()

    if "catalog" in text:
        return "catalog"
    if "search" in text:
        return "search"
    if "checkout" in text or "cart" in text:
        return "marketplace"
    if "payment" in text or "escrow" in text:
        return "marketplace"
    if "seller" in text:
        return "seller"
    if "fraud" in text or "kyc" in text:
        return "trust"
    if "seo" in text:
        return "seo"
    return "foundation"


def infer_priority(text):
    return "p1"


def infer_order(text, order_map):
    for key in order_map:
        if key in text.lower():
            return order_map[key]
    return 999


# -----------------------------
# ISSUE CREATION
# -----------------------------

def create_issue(task, index):
    body = f"""
## Objective
{task['title']}

## Area
{task['area']}

## Dependencies
{task['depends_on']}

## Acceptance
- {task['acceptance'][0]}
"""

    return api("POST", "/issues", {
        "title": f"{index:02d} - {task['title']}",
        "body": body,
        "labels": ["automation", f"area:{task['area']}"]
    })


# -----------------------------
# PROJECT STRUCTURE
# -----------------------------

def ensure_project_structure():
    """Ensure base project structure exists."""
    # Create docs/rules directory
    rules_dir = ROOT / "docs" / "rules"
    rules_dir.mkdir(parents=True, exist_ok=True)
    print(f"[INFO] Ensured directory: {rules_dir}")

    # Create .automation directory
    automation_dir = ROOT / ".automation"
    automation_dir.mkdir(parents=True, exist_ok=True)
    print(f"[INFO] Ensured directory: {automation_dir}")

    # Create state.json if it doesn't exist
    state_file = automation_dir / "state.json"
    if not state_file.exists():
        state_data = {
            "version": "1.0",
            "created_issues": {},
            "created_labels": [],
            "last_run": ""
        }
        state_file.write_text(json.dumps(state_data, indent=2))
        print(f"[INFO] Created state file: {state_file}")


# -----------------------------
# RULES CREATION
# -----------------------------

def create_rules_directory():
    """Create the docs/rules directory with base rule files."""
    rules_dir = ROOT / "docs" / "rules"

    base_rules = {
        "global.md": """# Global Development Rules

## General Principles
- Write clean, readable, and maintainable code
- Follow the principle of least surprise
- Document complex business logic
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility

## Code Quality
- No hardcoded values in production code
- Handle errors gracefully with appropriate logging
- Validate input data at system boundaries
- Use type hints where applicable
- Write self-documenting code

## Security
- Never log sensitive information
- Validate and sanitize all user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Follow the principle of least privilege

## Performance
- Optimize database queries and avoid N+1 problems
- Use appropriate data structures and algorithms
- Cache frequently accessed data when beneficial
- Monitor and profile performance bottlenecks
- Consider scalability in architectural decisions
""",
        "frontend.md": """# Frontend Development Rules

## Component Structure
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for type safety
- Follow atomic design principles

## State Management
- Use local state for component-specific data
- Lift state up when shared between siblings
- Use context for theme, user preferences, etc.
- Consider state management libraries for complex apps
- Avoid prop drilling with excessive depth

## Styling
- Use CSS modules or styled-components
- Follow BEM methodology for class names
- Maintain consistent spacing and typography
- Ensure responsive design across all screen sizes
- Test components in different viewports

## Performance
- Lazy load routes and heavy components
- Optimize images and assets
- Minimize bundle size with code splitting
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Accessibility
- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers
""",
        "backend.md": """# Backend Development Rules

## API Design
- Use RESTful conventions with proper HTTP methods
- Version your APIs from the beginning
- Return consistent JSON response formats
- Use appropriate HTTP status codes
- Document APIs with OpenAPI/Swagger

## Data Validation
- Validate all inputs on the server side
- Use schema validation libraries
- Sanitize data to prevent injection attacks
- Return meaningful error messages
- Handle edge cases and malformed data

## Security
- Implement authentication and authorization
- Use HTTPS in production
- Validate and sanitize all inputs
- Implement rate limiting and DDoS protection
- Log security events appropriately

## Database
- Use migrations for schema changes
- Implement proper indexing strategies
- Avoid raw SQL when possible
- Use connection pooling
- Implement database backups and recovery

## Error Handling
- Use structured error responses
- Log errors with appropriate levels
- Don't expose internal errors to clients
- Implement graceful degradation
- Monitor and alert on critical errors
""",
        "database.md": """# Database Development Rules

## Schema Design
- Use appropriate data types for each field
- Establish proper relationships between tables
- Implement referential integrity with foreign keys
- Use constraints to maintain data integrity
- Plan for future scalability

## Indexing
- Index foreign keys automatically
- Add indexes for frequently queried columns
- Consider composite indexes for multi-column queries
- Monitor index usage and performance
- Avoid over-indexing which slows writes

## Queries
- Use parameterized queries to prevent SQL injection
- Optimize queries with EXPLAIN plans
- Avoid SELECT * in production code
- Use appropriate JOIN types
- Implement pagination for large result sets

## Migrations
- Write reversible migrations
- Test migrations on staging environments
- Backup data before destructive migrations
- Use descriptive migration names
- Version control migration files

## Performance
- Monitor slow queries and optimize them
- Use database connection pooling
- Implement caching strategies
- Archive old data when appropriate
- Plan for database growth and scaling
""",
        "testing.md": """# Testing Rules

## Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Cover both happy path and error cases
- Write descriptive test names
- Maintain high code coverage (>80%)

## Integration Tests
- Test component interactions
- Use realistic test data
- Test external API integrations
- Verify data flow between systems
- Run tests in isolated environments

## End-to-End Tests
- Test complete user workflows
- Use headless browsers for web apps
- Test critical business paths
- Run E2E tests less frequently due to cost
- Focus on high-value user journeys

## Test Quality
- Tests should be fast and reliable
- Avoid flaky tests that fail randomly
- Use descriptive assertions and messages
- Test edge cases and boundary conditions
- Keep tests DRY but readable

## CI/CD Integration
- Run tests on every commit
- Fail builds on test failures
- Generate coverage reports
- Run tests in parallel when possible
- Monitor test execution time
""",
        "deployment.md": """# Deployment Rules

## Environment Management
- Use separate environments (dev, staging, prod)
- Store configuration in environment variables
- Never commit secrets to version control
- Use infrastructure as code
- Document deployment procedures

## Release Process
- Use semantic versioning
- Tag releases in git
- Maintain changelog
- Test deployments on staging first
- Plan rollback strategies

## Monitoring
- Implement health checks
- Monitor application metrics
- Set up alerting for critical issues
- Log structured data
- Use distributed tracing

## Security
- Scan for vulnerabilities before deployment
- Use minimal base images
- Run containers as non-root users
- Implement network security policies
- Regularly update dependencies

## Performance
- Optimize container images
- Configure resource limits
- Use CDN for static assets
- Implement caching strategies
- Monitor performance metrics
""",
        "seo.md": """# SEO Rules

## Technical SEO
- Implement proper URL structure
- Use semantic HTML elements
- Ensure fast page load times
- Make sites mobile-friendly
- Implement structured data markup

## Content SEO
- Use descriptive page titles
- Write compelling meta descriptions
- Include relevant keywords naturally
- Create high-quality, valuable content
- Use heading hierarchy properly

## Performance
- Optimize images and assets
- Minimize render-blocking resources
- Use lazy loading for images
- Implement caching strategies
- Monitor Core Web Vitals

## Accessibility
- Use alt text for images
- Ensure keyboard navigation
- Maintain color contrast ratios
- Provide text alternatives for media
- Test with assistive technologies

## Analytics
- Implement tracking properly
- Set up conversion goals
- Monitor search console data
- Track user behavior and engagement
- Use data to inform content strategy
""",
        "ui-ux.md": """# UI/UX Rules

## Design Principles
- Keep interfaces clean and uncluttered
- Use consistent visual hierarchy
- Maintain design system consistency
- Ensure intuitive navigation
- Follow platform-specific conventions

## User Experience
- Design for the user's mental model
- Minimize cognitive load
- Provide clear feedback for actions
- Use progressive disclosure
- Support user goals efficiently

## Accessibility
- Design for all users including those with disabilities
- Ensure sufficient color contrast
- Make interactive elements clearly identifiable
- Support keyboard navigation
- Test with real users

## Responsive Design
- Design mobile-first
- Ensure consistent experience across devices
- Test on various screen sizes
- Optimize touch targets
- Consider different input methods

## Usability Testing
- Test designs with real users
- Iterate based on user feedback
- A/B test significant changes
- Monitor user behavior analytics
- Continuously improve the experience
"""
    }

    for filename, content in base_rules.items():
        filepath = rules_dir / filename
        if not filepath.exists():
            filepath.write_text(content)
            print(f"[INFO] Created rule file: {filepath}")


# -----------------------------
# MAIN
# -----------------------------

def main():
    print("[INFO] Ensuring project structure")
    ensure_project_structure()

    print("[INFO] Reading project.md")

    md = PROJECT_MD.read_text()

    print("[INFO] Parsing tasks from Markdown")

    tasks = parse_tasks(md)

    print(f"[INFO] {len(tasks)} tasks detected")

    print("[INFO] Creating rules directory")
    create_rules_directory()

    created = {}

    for i, task in enumerate(tasks, start=1):
        issue = create_issue(task, i)
        created[task["id"]] = issue["number"]
        print(f"[INFO] Created issue #{issue['number']}")

    print("[DONE]")


if __name__ == "__main__":
    main()