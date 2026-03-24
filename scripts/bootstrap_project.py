"""Bootstrap GitHub issues from docs/project.md.

This script parses the structured Markdown document at docs/project.md,
infers project areas from the "Modules" section, and generates GitHub issues
for the tasks listed in "Proposed tasks". It is designed to be idempotent and
to tolerate normal Markdown variations without depending on external schemas.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import textwrap
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


DEFAULT_GLOBAL_RULES = """# Global

## Purpose
- Keep issue generation aligned with `docs/project.md`.
- Treat Markdown as the single source of truth for backlog structure.
- Prefer stable, repeatable output over aggressive guessing.

## Execution rules
- Generate one structured issue per proposed task.
- Use exact area names defined by the project markdown.
- Keep dependencies simple and explicit.
- Use defaults instead of failing when optional sections are missing.
"""


AREA_RULE_TEMPLATE = """# {area}

## Scope
- Changes in this area must stay aligned with the marketplace architecture.
- Acceptance criteria should be concrete, verifiable, and scoped to one task.
- Dependencies should reference upstream platform capabilities when needed.

## Delivery expectations
- Keep issue descriptions actionable for a future implementer.
- Prefer incremental work over broad cross-area rewrites.
- Preserve compatibility with the rest of the modular monolith.
"""


SECTION_ALIASES = {
    "objective": ("objective", "objetivo"),
    "scope": ("scope", "alcance"),
    "architecture_recommended": (
        "architecture recommended",
        "recommended architecture",
        "arquitectura recomendada",
    ),
    "modules": ("modules", "modulos", "módulos"),
    "dependencies": ("dependencies", "dependencias"),
    "order_of_construction": (
        "order of construction",
        "construction order",
        "orden de construccion",
        "orden de construcción",
    ),
    "risks": ("risks", "riesgos"),
    "priorities": ("priorities", "prioridades"),
    "proposed_tasks": ("proposed tasks", "tasks", "tareas propuestas"),
}


PRIORITY_LEVELS = ("P0", "P1", "P2", "P3")
WORD_RE = re.compile(r"[a-z0-9]+")


@dataclass
class Heading:
    level: int
    title: str
    body: List[str] = field(default_factory=list)


@dataclass
class ProjectSpec:
    title: str = "Untitled project"
    objective: str = ""
    scope: str = ""
    architecture_recommended: str = ""
    modules: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    order_of_construction: List[str] = field(default_factory=list)
    risks: List[str] = field(default_factory=list)
    priorities: Dict[str, List[str]] = field(default_factory=dict)
    proposed_tasks: List[str] = field(default_factory=list)


@dataclass
class RuleArea:
    slug: str
    label: str
    path: Path
    content: str


@dataclass
class IssueSpec:
    task_id: str
    title: str
    body: str
    labels: List[str]
    area: str
    priority: str
    dependencies: List[str]
    fingerprint: str


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    ascii_only = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    lowered = ascii_only.lower()
    return re.sub(r"\s+", " ", lowered).strip()


def slugify(value: str) -> str:
    normalized = normalize_text(value)
    slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return slug or "item"


def tokenize(value: str) -> List[str]:
    return WORD_RE.findall(normalize_text(value))


def compact_line(line: str) -> str:
    return re.sub(r"\s+", " ", line.strip())


def split_list_items(text: str) -> List[str]:
    items: List[str] = []
    current: Optional[str] = None
    for raw_line in text.splitlines():
        stripped = raw_line.strip()
        if not stripped:
            continue
        bullet_match = re.match(r"^[-*+]\s+(.*)$", stripped)
        number_match = re.match(r"^\d+[\.)]\s+(.*)$", stripped)
        if bullet_match or number_match:
            if current:
                items.append(compact_line(current))
            current = (bullet_match or number_match).group(1).strip()
            continue
        if current is not None:
            current = f"{current} {stripped}"
        else:
            items.append(compact_line(stripped))
    if current:
        items.append(compact_line(current))
    return items


def parse_markdown(md_text: str) -> List[Heading]:
    headings: List[Heading] = []
    current: Optional[Heading] = None
    for line in md_text.splitlines():
        match = re.match(r"^(#{1,6})\s+(.*)$", line)
        if match:
            current = Heading(level=len(match.group(1)), title=match.group(2).strip())
            headings.append(current)
            continue
        if current is not None:
            current.body.append(line)
    return headings


def find_heading(headings: Sequence[Heading], aliases: Sequence[str], level: Optional[int] = None) -> Optional[Heading]:
    alias_set = {normalize_text(alias) for alias in aliases}
    for heading in headings:
        if level is not None and heading.level != level:
            continue
        if normalize_text(heading.title) in alias_set:
            return heading
    return None


def find_child_headings(headings: Sequence[Heading], parent: Heading, child_level: int) -> List[Heading]:
    result: List[Heading] = []
    try:
        start = headings.index(parent) + 1
    except ValueError:
        return result
    for heading in headings[start:]:
        if heading.level <= parent.level:
            break
        if heading.level == child_level:
            result.append(heading)
    return result


def normalize_area_name(name: str) -> str:
    lowered = normalize_text(name)
    lowered = re.sub(r"^\d+[\.)]\s*", "", lowered)
    return compact_line(lowered)


def order_step_area(step: str, modules: Sequence[str]) -> str:
    prefix = step.split(":", 1)[0].strip()
    if prefix:
        mapped = best_area_match(prefix, modules)
        if mapped:
            return mapped
    return step


def parse_project_md(path: Path) -> ProjectSpec:
    if not path.exists():
        raise FileNotFoundError(f"Project markdown not found: {path}")

    headings = parse_markdown(read_text(path))
    title_heading = next((heading for heading in headings if heading.level == 1), None)
    spec = ProjectSpec(title=title_heading.title if title_heading else "Untitled project")

    objective = find_heading(headings, SECTION_ALIASES["objective"], level=2)
    scope = find_heading(headings, SECTION_ALIASES["scope"], level=2)
    architecture = find_heading(headings, SECTION_ALIASES["architecture_recommended"], level=2)
    modules = find_heading(headings, SECTION_ALIASES["modules"], level=2)
    dependencies = find_heading(headings, SECTION_ALIASES["dependencies"], level=2)
    order_of_construction = find_heading(headings, SECTION_ALIASES["order_of_construction"], level=2)
    risks = find_heading(headings, SECTION_ALIASES["risks"], level=2)
    priorities = find_heading(headings, SECTION_ALIASES["priorities"], level=2)
    proposed_tasks = find_heading(headings, SECTION_ALIASES["proposed_tasks"], level=2)

    spec.objective = "\n".join(objective.body).strip() if objective else ""
    spec.scope = "\n".join(scope.body).strip() if scope else ""
    spec.architecture_recommended = "\n".join(architecture.body).strip() if architecture else ""
    spec.modules = split_list_items("\n".join(modules.body)) if modules else []
    spec.dependencies = split_list_items("\n".join(dependencies.body)) if dependencies else []
    spec.order_of_construction = split_list_items("\n".join(order_of_construction.body)) if order_of_construction else []
    spec.risks = split_list_items("\n".join(risks.body)) if risks else []
    spec.proposed_tasks = split_list_items("\n".join(proposed_tasks.body)) if proposed_tasks else []

    if priorities:
        child_sections = find_child_headings(headings, priorities, child_level=3)
        for child in child_sections:
            level_name = normalize_text(child.title).upper()
            items = split_list_items("\n".join(child.body))
            if level_name:
                spec.priorities[level_name] = items

    return spec


def ensure_rules_dir(rules_dir: Path, modules: Sequence[str]) -> None:
    rules_dir.mkdir(parents=True, exist_ok=True)

    global_rule = rules_dir / "global.md"
    if not global_rule.exists():
        write_text(global_rule, DEFAULT_GLOBAL_RULES)

    expected = {slugify(area): area for area in modules}
    for slug, area in expected.items():
        path = rules_dir / f"{slug}.md"
        if not path.exists():
            write_text(path, AREA_RULE_TEMPLATE.format(area=area))


def extract_rule_label(content: str, fallback: str) -> str:
    for line in content.splitlines():
        match = re.match(r"^#\s+(.*)$", line.strip())
        if match:
            return match.group(1).strip() or fallback
    return fallback


def load_rule_areas(rules_dir: Path) -> Dict[str, RuleArea]:
    areas: Dict[str, RuleArea] = {}
    for path in sorted(rules_dir.glob("*.md")):
        content = read_text(path)
        fallback = path.stem.replace("-", " ").strip().title()
        label = extract_rule_label(content, fallback)
        areas[path.stem] = RuleArea(slug=path.stem, label=label, path=path, content=content)
    return areas


def overlap_score(text_a: str, text_b: str) -> int:
    tokens_a = set(tokenize(text_a))
    tokens_b = set(tokenize(text_b))
    if not tokens_a or not tokens_b:
        return 0
    return len(tokens_a & tokens_b)


def best_area_match(text: str, modules: Sequence[str]) -> Optional[str]:
    best_name: Optional[str] = None
    best_score = 0
    normalized_text = normalize_text(text)
    for module in modules:
        score = overlap_score(text, module)
        if normalize_text(module) in normalized_text:
            score += 3
        normalized_module = normalize_area_name(module)
        if normalized_module and normalized_module.split(":")[0] in normalized_text:
            score += 2
        if score > best_score:
            best_score = score
            best_name = module
    return best_name if best_score > 0 else None


def infer_area(task: str, modules: Sequence[str], order_steps: Sequence[str]) -> str:
    direct = best_area_match(task, modules)
    if direct:
        return direct

    for step in order_steps:
        prefix = step.split(":", 1)[0].strip()
        if prefix and overlap_score(task, prefix) > 0:
            mapped = best_area_match(prefix, modules)
            if mapped:
                return mapped

    keyword_map = {
        "catalog": "Catalog and taxonomy",
        "taxonomy": "Catalog and taxonomy",
        "search": "Search and faceted discovery",
        "card": "Card detail pages",
        "checkout": "Cart and checkout",
        "cart": "Cart and checkout",
        "payment": "Payments and escrow",
        "escrow": "Payments and escrow",
        "shipping": "Orders and shipping",
        "seller": "Seller portal",
        "kyc": "Trust and safety",
        "kyb": "Trust and safety",
        "fraud": "Trust and safety",
        "seo": "SEO and content engine",
        "content": "SEO and content engine",
        "community": "Community layer",
        "watchlists": "Community layer",
        "alerts": "Community layer",
        "moderation": "Admin and moderation tools",
        "admin": "Admin and moderation tools",
    }
    lowered = normalize_text(task)
    for keyword, area in keyword_map.items():
        if keyword in lowered and area in modules:
            return area

    return modules[0] if modules else "General"


def infer_priority(task: str, priorities: Dict[str, List[str]], area: str) -> str:
    lowered_task = normalize_text(task)
    best_level = "P1"
    best_score = 0

    for level, items in priorities.items():
        for item in items:
            score = overlap_score(task, item)
            normalized_item = normalize_text(item)
            if normalized_item and normalized_item in lowered_task:
                score += 3
            if normalize_text(area) == normalized_item:
                score += 2
            if score > best_score:
                best_score = score
                best_level = level

    if best_score > 0:
        return best_level

    if normalize_text(area) in {
        normalize_text("Catalog and taxonomy"),
        normalize_text("Search and faceted discovery"),
        normalize_text("Card detail pages"),
        normalize_text("Cart and checkout"),
        normalize_text("Payments and escrow"),
        normalize_text("Trust and safety"),
    }:
        return "P0"
    return "P1"


def parse_dependency_map(project: ProjectSpec) -> Dict[str, List[str]]:
    dependency_map: Dict[str, List[str]] = {}
    for line in project.dependencies:
        left, sep, right = line.partition(" depends on ")
        if not sep:
            continue
        area = best_area_match(left, project.modules)
        if not area:
            continue
        dependent_areas: List[str] = []
        for module in project.modules:
            if module == area:
                continue
            if overlap_score(right, module) > 0 or normalize_text(module) in normalize_text(right):
                dependent_areas.append(module)
        dependency_map[area] = dependent_areas
    return dependency_map


def order_dependencies(project: ProjectSpec) -> Dict[str, List[str]]:
    dependencies: Dict[str, List[str]] = {}
    ordered_areas: List[str] = []
    for step in project.order_of_construction:
        area = order_step_area(step, project.modules)
        if area in project.modules and area not in ordered_areas:
            ordered_areas.append(area)

    for index, area in enumerate(ordered_areas):
        if index == 0:
            dependencies[area] = []
        else:
            dependencies[area] = [ordered_areas[index - 1]]
    return dependencies


def merge_dependencies(values: Iterable[Iterable[str]]) -> List[str]:
    result: List[str] = []
    seen = set()
    for group in values:
        for item in group:
            if item and item not in seen:
                seen.add(item)
                result.append(item)
    return result


def build_acceptance_criteria(task: str, area: str, priority: str, dependencies: Sequence[str]) -> List[str]:
    criteria = [
        f"The task is implemented within the `{area}` area with a clear, testable scope.",
        "The change is documented enough for another contributor to continue the work.",
        "The implementation respects the architecture and marketplace constraints described in `docs/project.md`.",
    ]
    if dependencies:
        criteria.append("Documented dependencies are either satisfied or explicitly handled in the implementation plan.")
    if priority == "P0":
        criteria.append("The outcome covers MVP-critical behavior without introducing unnecessary scope.")
    return criteria


def build_issue_body(
    project: ProjectSpec,
    task: str,
    task_id: str,
    area: str,
    priority: str,
    dependencies: Sequence[str],
) -> str:
    dependency_lines = "\n".join(f"- {item}" for item in dependencies) if dependencies else "- None"
    acceptance = "\n".join(f"- {item}" for item in build_acceptance_criteria(task, area, priority, dependencies))
    order_hint = next((step for step in project.order_of_construction if overlap_score(step, area) > 0), "")
    notes = [
        f"Project: `{project.title}`",
        f"Task ID: `{task_id}`",
        f"Area: `{area}`",
        f"Priority: `{priority}`",
    ]
    if order_hint:
        notes.append(f"Construction stage hint: `{order_hint}`")

    body = f"""## Summary
{task}

## Metadata
{chr(10).join(f"- {line}" for line in notes)}

## Dependencies
{dependency_lines}

## Acceptance criteria
{acceptance}

## Notes
- Use `docs/project.md` as the source of truth.
- Keep the implementation scoped to this task unless a listed dependency requires shared groundwork.
- Preserve compatibility with adjacent areas in the modular monolith.
"""
    return textwrap.dedent(body).strip() + "\n"


def fingerprint_text(*parts: str) -> str:
    digest = hashlib.sha256()
    for part in parts:
        digest.update(part.encode("utf-8"))
        digest.update(b"\0")
    return digest.hexdigest()[:12]


def build_task_id(index: int, task: str) -> str:
    return f"TASK-{index:03d}-{fingerprint_text(task)[:6].upper()}"


def build_issue_title(index: int, task: str) -> str:
    return f"{index:03d}. {task.strip().rstrip('.')}"


def generate_issues(project: ProjectSpec, rules: Dict[str, RuleArea]) -> List[IssueSpec]:
    modules = project.modules or [
        rule.label for rule in rules.values() if rule.label != "Global"
    ]
    if not modules:
        modules = ["General"]

    rule_labels = {rule.label for rule in rules.values()}
    area_dependencies = parse_dependency_map(project)
    area_order_dependencies = order_dependencies(project)
    issues: List[IssueSpec] = []
    seen_tasks = set()

    for index, task in enumerate(project.proposed_tasks, start=1):
        normalized_task = normalize_text(task)
        if not normalized_task or normalized_task in seen_tasks:
            continue
        seen_tasks.add(normalized_task)

        area = infer_area(task, modules, project.order_of_construction)
        if area not in rule_labels and "Global" in rule_labels:
            area = "Global"
        priority = infer_priority(task, project.priorities, area)
        dependencies = merge_dependencies(
            [
                area_dependencies.get(area, []),
                area_order_dependencies.get(area, []),
            ]
        )
        task_id = build_task_id(index, task)
        title = build_issue_title(index, task)
        fingerprint = fingerprint_text(project.title, task_id, area, priority, task)
        body = build_issue_body(project, task, task_id, area, priority, dependencies)

        issues.append(
            IssueSpec(
                task_id=task_id,
                title=title,
                body=body,
                labels=[area],
                area=area,
                priority=priority,
                dependencies=dependencies,
                fingerprint=fingerprint,
            )
        )
    return issues


def github_api_request(method: str, url: str, token: str, payload: Optional[dict] = None) -> object:
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "cardbuy-bootstrap",
    }
    body = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(url=url, method=method.upper(), data=body, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API error {exc.code} on {method} {url}: {details}") from exc


def list_labels(repo: str, token: str) -> List[dict]:
    response = github_api_request("GET", f"https://api.github.com/repos/{repo}/labels?per_page=100", token)
    return response if isinstance(response, list) else []


def create_label(repo: str, token: str, name: str, color: str) -> None:
    github_api_request(
        "POST",
        f"https://api.github.com/repos/{repo}/labels",
        token,
        {"name": name, "color": color, "description": f"Area label for {name}"},
    )


def list_issues(repo: str, token: str) -> List[dict]:
    response = github_api_request("GET", f"https://api.github.com/repos/{repo}/issues?state=all&per_page=100", token)
    return response if isinstance(response, list) else []


def create_issue(repo: str, token: str, issue: IssueSpec) -> dict:
    response = github_api_request(
        "POST",
        f"https://api.github.com/repos/{repo}/issues",
        token,
        {"title": issue.title, "body": issue.body, "labels": issue.labels},
    )
    return response if isinstance(response, dict) else {}


def update_issue(repo: str, token: str, number: int, issue: IssueSpec) -> dict:
    response = github_api_request(
        "PATCH",
        f"https://api.github.com/repos/{repo}/issues/{number}",
        token,
        {"title": issue.title, "body": issue.body, "labels": issue.labels, "state": "open"},
    )
    return response if isinstance(response, dict) else {}


def ensure_labels(repo: str, token: str, rules: Dict[str, RuleArea], dry_run: bool) -> List[str]:
    required_labels = sorted({rule.label for rule in rules.values() if rule.label != "Global"})
    if dry_run:
        return required_labels

    existing = {item.get("name", "") for item in list_labels(repo, token)}
    for label in required_labels:
        if label not in existing:
            create_label(repo, token, label, color="0E8A16")
    return required_labels


def load_state(path: Path) -> dict:
    if not path.exists():
        return {
            "version": 2,
            "project_fingerprint": "",
            "generated_at": None,
            "issues": {},
            "labels": [],
        }

    try:
        data = json.loads(read_text(path))
    except json.JSONDecodeError:
        return {
            "version": 2,
            "project_fingerprint": "",
            "generated_at": None,
            "issues": {},
            "labels": [],
        }

    issues = data.get("issues")
    if not isinstance(issues, dict):
        issues = data.get("created_issues", {})

    return {
        "version": 2,
        "project_fingerprint": str(data.get("project_fingerprint", "")),
        "generated_at": data.get("generated_at") or data.get("last_run"),
        "issues": issues if isinstance(issues, dict) else {},
        "labels": data.get("labels") or data.get("created_labels") or [],
    }


def save_state(path: Path, state: dict) -> None:
    write_text(path, json.dumps(state, indent=2, ensure_ascii=False) + "\n")


def sync_issues(repo: str, token: str, issues: Sequence[IssueSpec], state: dict, dry_run: bool) -> dict:
    existing_map = state.get("issues", {})
    remote_by_title = {}
    if not dry_run:
        for remote in list_issues(repo, token):
            title = str(remote.get("title", "")).strip()
            if title:
                remote_by_title[title] = remote

    updated_state: Dict[str, dict] = {}
    for issue in issues:
        state_entry = existing_map.get(issue.task_id, {})
        number = state_entry.get("issue_number")
        if dry_run:
            print(f"[DRY RUN] {issue.title} [{issue.area}] priority={issue.priority}")
            updated_state[issue.task_id] = {
                "issue_number": number or 0,
                "title": issue.title,
                "area": issue.area,
                "priority": issue.priority,
                "fingerprint": issue.fingerprint,
            }
            continue

        if isinstance(number, int) and number > 0:
            response = update_issue(repo, token, number, issue)
            issue_number = int(response["number"])
        elif issue.title in remote_by_title:
            issue_number = int(remote_by_title[issue.title]["number"])
            update_issue(repo, token, issue_number, issue)
        else:
            response = create_issue(repo, token, issue)
            issue_number = int(response["number"])

        updated_state[issue.task_id] = {
            "issue_number": issue_number,
            "title": issue.title,
            "area": issue.area,
            "priority": issue.priority,
            "fingerprint": issue.fingerprint,
        }

    state["issues"] = updated_state
    state["generated_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    return state


def summarize(project: ProjectSpec, issues: Sequence[IssueSpec]) -> str:
    area_counts: Dict[str, int] = {}
    for issue in issues:
        area_counts[issue.area] = area_counts.get(issue.area, 0) + 1
    distribution = ", ".join(f"{area}: {count}" for area, count in sorted(area_counts.items()))
    return (
        f"Project: {project.title}\n"
        f"Areas discovered: {len(project.modules)}\n"
        f"Tasks converted to issues: {len(issues)}\n"
        f"Distribution: {distribution}\n"
    )


def validate(issues: Sequence[IssueSpec], rules: Dict[str, RuleArea]) -> None:
    allowed = {rule.label for rule in rules.values()}
    if not issues:
        raise ValueError("No issues were generated from `docs/project.md`.")
    for issue in issues:
        if issue.area not in allowed:
            raise ValueError(f"Unknown area label: {issue.area}")
        if not issue.title.strip():
            raise ValueError("Generated an issue with an empty title.")
        if not issue.body.strip():
            raise ValueError(f"Issue body is empty for {issue.task_id}.")


def build_project_fingerprint(project: ProjectSpec) -> str:
    parts = [
        project.title,
        project.objective,
        project.scope,
        project.architecture_recommended,
        "|".join(project.modules),
        "|".join(project.dependencies),
        "|".join(project.order_of_construction),
        "|".join(project.risks),
        json.dumps(project.priorities, sort_keys=True),
        "|".join(project.proposed_tasks),
    ]
    return fingerprint_text(*parts)


def main() -> int:
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    token = os.getenv("GITHUB_TOKEN", "").strip()
    dry_run = os.getenv("ISSUE_DRY_RUN", "0").strip() == "1"
    project_path = Path(os.getenv("PROJECT_MD_PATH", "docs/project.md"))
    rules_dir = Path(os.getenv("RULES_DIR", "docs/rules"))
    state_path = Path(os.getenv("STATE_PATH", ".automation/state.json"))

    if not repo:
        print("ERROR: GITHUB_REPOSITORY is required.", file=sys.stderr)
        return 2
    if not token:
        print("ERROR: GITHUB_TOKEN is required.", file=sys.stderr)
        return 2

    try:
        project = parse_project_md(project_path)
        ensure_rules_dir(rules_dir, project.modules)
        rules = load_rule_areas(rules_dir)
        ensure_labels(repo, token, rules, dry_run=dry_run)
        issues = generate_issues(project, rules)
        validate(issues, rules)

        state = load_state(state_path)
        state["project_fingerprint"] = build_project_fingerprint(project)
        state["labels"] = sorted({rule.label for rule in rules.values() if rule.label != "Global"})

        print(summarize(project, issues))
        updated_state = sync_issues(repo, token, issues, state, dry_run=dry_run)
        save_state(state_path, updated_state)

        if dry_run:
            print("Dry run complete. No GitHub issues were created or updated.")
        else:
            print(f"Synced {len(issues)} issues.")
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
