"""Build native spawn_agent arguments for a registered stage 2/3 worker.

Usage:
    python scripts/build_dispatch.py --stage 2 --lesson-id LESSON_ID --assignment contract.json --output dispatch.json

Assignment is UTF-8 JSON with one `lesson_id` and non-empty `change`, `scope`,
and `acceptance` strings. The scope must describe exactly ONE lesson from the
ONE W1 preflight, including source paths/revisions, A/B, exceptional ranges,
shared-file owner, last confirmed state and allowed writes. The JSON output is
for a *native* delegated agent, not create_thread.
No agent, user chat, lesson or policy override is started by this script.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import tomllib
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
MODEL = "chatgpt-web/gpt-6-sol"
EFFORT = "high"
STAGES = {
    "2": ("pymentor-plan-worker.toml", "pymentor_plan_worker"),
    "3": ("pymentor-lesson-worker.toml", "pymentor_lesson_worker"),
}


def read_text(path: Path) -> str:
    content = path.read_text(encoding="utf-8-sig").strip()
    if not content:
        raise ValueError(f"Empty input: {path}")
    return content


def read_assignment(path: Path, expected_lesson_id: str) -> dict[str, object]:
    """Load and validate a self-contained contract for exactly one lesson."""
    try:
        assignment = json.loads(read_text(path))
    except json.JSONDecodeError as error:
        raise ValueError(f"Assignment must be a JSON lesson contract: {path}") from error
    if not isinstance(assignment, dict):
        raise ValueError("Assignment must be a JSON object for exactly one lesson")
    lesson_id = assignment.get("lesson_id")
    if not isinstance(lesson_id, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:-]*", lesson_id):
        raise ValueError("lesson_id must be one non-empty stable ID (not a list)")
    if lesson_id != expected_lesson_id:
        raise ValueError(f"Assignment lesson_id {lesson_id!r} does not match --lesson-id {expected_lesson_id!r}")
    for field in ("change", "scope", "acceptance"):
        value = assignment.get(field)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"Assignment requires a non-empty {field!r} string")
    return assignment


def validate_effective_policy(policy: object) -> None:
    """Check canonical `orchestrator.py show` output, optionally enveloped.

    A models[] session override is an input to policy resolution, not evidence
    that the effective model pool permits the registered worker's high effort.
    """
    if not isinstance(policy, dict):
        raise ValueError("Effective policy must be a JSON object")
    effective = policy.get("effective", policy)
    if not isinstance(effective, dict):
        raise ValueError("Invalid effective policy envelope")
    pool = effective.get("pool")
    if not isinstance(pool, dict) or not pool:
        raise ValueError("Effective policy requires a non-empty canonical pool dict; models[] override is not a snapshot")
    model_config = pool.get(MODEL)
    if not isinstance(model_config, dict):
        raise ValueError(f"Effective pool does not permit {MODEL}")
    efforts = model_config.get("efforts")
    if not isinstance(efforts, list) or EFFORT not in efforts:
        raise ValueError(f"Effective pool does not permit {MODEL} / {EFFORT}")


def build_payload(
    stage: str,
    assignment: Path,
    lesson_id: str,
    worker_skill: Path | None,
    policy_file: Path | None = None,
) -> dict[str, str]:
    """Package one lesson assignment; runtime admission remains Coordinator-owned."""
    profile_name, role_name = STAGES[stage]
    profile_path = ROOT / ".codex" / "agents" / profile_name
    with profile_path.open("rb") as stream:
        profile = tomllib.load(stream)
    if profile.get("model") != MODEL or profile.get("model_reasoning_effort") != EFFORT:
        raise ValueError(f"Worker profile must use {MODEL} / {EFFORT}: {profile_path}")

    role = profile.get("developer_instructions")
    if not isinstance(role, str) or not role.strip():
        raise ValueError(f"Missing developer_instructions: {profile_path}")

    if profile.get("name") != role_name:
        raise ValueError(f"Native role name mismatch: {profile_path}")

    if policy_file is not None:
        policy = json.loads(read_text(policy_file))
        # Snapshot supplied by Coordinator after central `orchestrator.py show`.
        # Do not read/write global policy, infer session IDs or spawn on behalf of root.
        validate_effective_policy(policy)

    parts = [
        f"Ровно одно занятие stage {stage} для native роли {role_name}. "
        "Исходный чат остаётся единственным Coordinator. Выполняй только назначенные "
        "операции в разрешённых файлах. Сам читай применимые общие/stage инструкции "
        "однократно на контекст и актуальную методичку перед зависимым проходом. "
        "Пройди все этапы только назначенного занятия и остановись. Не бери другое занятие, не создавай чаты или "
        "дочерних агентов. Используй имеющуюся подтверждённую опись и точные "
        "source revisions. Сначала устрани конкретный дефект или внеси указанную "
        "содержательную правку. Повторно читать полный source или повторять полный "
        "набор тестов можно только при новых свидетельствах, требующих этого. "
        "При восстановлении не повторяй ACCEPTED, продолжай "
        "лишь подтверждённый незавершённый остаток. В RUN сохраняй lesson, "
        "worker ID, phase, status, last confirmed artifact/revision. Верни "
        "компактный результат с путями, проверками и остатком "
        "после завершения назначенного занятия или блокера. Список из нескольких занятий в назначении верни как ошибку scope.",
        "Применимые инструкции (читать по месту): docs/make les stage/AGENTS.md, "
        "docs/make les stage/BATCH_WORKFLOW.md и AGENTS.md/README.md выбранного stage.",
    ]
    if worker_skill is not None:
        parts.append("ВЫБРАННЫЙ WORKER-SKILL:\n" + read_text(worker_skill))
    contract = read_assignment(assignment, lesson_id)
    parts.append(
        "ЕДИНСТВЕННЫЙ LESSON_ID: " + lesson_id + "\n"
        "СОДЕРЖАТЕЛЬНОЕ ИЗМЕНЕНИЕ:\n" + str(contract["change"]).strip() + "\n"
        "SCOPE ОДНОГО ЗАНЯТИЯ И ГРАНИЦЫ ЗАПИСИ:\n" + str(contract["scope"]).strip() + "\n"
        "ПРИЕМКА:\n" + str(contract["acceptance"]).strip()
    )
    # These are valid native multi_agent_v1.spawn_agent arguments. The role's
    # registered developer_instructions/model/high are already supplied by Codex.
    return {"agent_type": role_name, "message": "\n\n".join(parts)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=STAGES, required=True)
    parser.add_argument("--lesson-id", required=True, help="One stable lesson ID; assignment JSON must match")
    parser.add_argument("--assignment", type=Path, required=True, help="JSON object: lesson_id, change, scope, acceptance strings")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--worker-skill", type=Path)
    parser.add_argument(
        "--policy-file", type=Path,
        help="Optional orchestrator.py show JSON (canonical pool/efforts, optional effective envelope); models[] override is not accepted as a snapshot",
    )
    args = parser.parse_args()

    try:
        source_files = {args.assignment.resolve()}
        if args.worker_skill:
            source_files.add(args.worker_skill.resolve())
        if args.policy_file:
            source_files.add(args.policy_file.resolve())
        source_files.add((ROOT / ".codex" / "agents" / STAGES[args.stage][0]).resolve())
        if args.output.resolve() in source_files:
            raise ValueError("Output must not overwrite an input file")
        result = build_payload(args.stage, args.assignment, args.lesson_id, args.worker_skill, args.policy_file)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except (OSError, ValueError, tomllib.TOMLDecodeError, json.JSONDecodeError) as error:
        print(f"dispatch: {error}", file=sys.stderr)
        return 1

    # Keep assignment and optional skill text out of stdout.
    print(f"dispatch saved: {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
