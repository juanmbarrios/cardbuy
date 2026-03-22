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
# MAIN
# -----------------------------

def main():
    print("[INFO] Reading project.md")

    md = PROJECT_MD.read_text()

    print("[INFO] Parsing tasks from Markdown")

    tasks = parse_tasks(md)

    print(f"[INFO] {len(tasks)} tasks detected")

    created = {}

    for i, task in enumerate(tasks, start=1):
        issue = create_issue(task, i)
        created[task["id"]] = issue["number"]
        print(f"[INFO] Created issue #{issue['number']}")

    print("[DONE]")


if __name__ == "__main__":
    main()