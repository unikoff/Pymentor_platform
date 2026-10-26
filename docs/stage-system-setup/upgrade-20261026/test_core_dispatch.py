"""Focused CORE regression cases; no spawn, lesson edits or policy mutation.

Run: python docs/stage-system-setup/upgrade-20261026/test_core_dispatch.py
CLI: python scripts/build_dispatch.py --stage 2 --lesson-id <ID> --assignment contract.json --policy-file policy.json --output dispatch.json
"""
from __future__ import annotations

import copy
import json
from pathlib import Path
import runpy
import subprocess
import sys
import unittest
import uuid


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "scripts/build_dispatch.py"
HELPER = runpy.run_path(str(SCRIPT), run_name="core_dispatch_checks")
MODEL = "chatgpt-web/gpt-6-sol"
CANONICAL = {
    "primary": MODEL,
    "pool": {MODEL: {"efforts": ["medium", "high"], "default_effort": "medium"}},
    "mode": "full", "web_parallel": 5, "total_parallel": 5,
    "when_web_full": "wait", "wait_seconds": 20,
    "base_web_parallel": 5, "base_total_parallel": 8,
}


class DispatchPolicyChecks(unittest.TestCase):
    def test_canonical_and_effective_envelope(self):
        for value in (CANONICAL, {"effective": CANONICAL}):
            with self.subTest(enveloped="effective" in value):
                original = copy.deepcopy(value)
                HELPER["validate_effective_policy"](value)
                self.assertEqual(value, original)

    def test_single_lesson_contract_requires_content_scope_and_acceptance(self):
        valid = {
            "lesson_id": "core-check",
            "change": "Fix the demonstrated stale-value defect in the lesson example.",
            "scope": "Only lesson core-check and its directly owned source files.",
            "acceptance": "The defect is covered by a focused check; preserve prerequisite boundaries.",
        }
        path = Path(__file__)
        helper_globals = HELPER["read_assignment"].__globals__
        original_read = helper_globals["read_text"]
        try:
            helper_globals["read_text"] = lambda _: json.dumps(valid)
            self.assertEqual(HELPER["read_assignment"](path, "core-check"), valid)
            for invalid in (
                {**valid, "lesson_id": ["core-check", "other"]},
                {**valid, "lesson_id": ""},
                {**valid, "lesson_id": "other"},
                {**valid, "change": "  "},
                {**valid, "scope": []},
                {**valid, "acceptance": ""},
            ):
                helper_globals["read_text"] = lambda _, value=invalid: json.dumps(value)
                with self.subTest(contract=invalid), self.assertRaises(ValueError):
                    HELPER["read_assignment"](path, "core-check")
        finally:
            helper_globals["read_text"] = original_read

    def test_reject_unresolved_forbidden_or_no_high(self):
        bad = [
            None, [], {}, {"models": [MODEL]},
            {"pool": {}}, {"pool": []}, {"pool": None},
            {"pool": {"other-model": {"efforts": ["high"]}}},
            {"pool": {MODEL: None}},
            {"pool": {MODEL: {}}},
            {"pool": {MODEL: {"efforts": ["medium"], "default_effort": "high"}}},
            {"pool": {MODEL: {"efforts": "high"}}},
            {"effective": None}, {"effective": {}},
            {"effective": {"pool": {}}, "pool": CANONICAL["pool"]},
            {"models": [MODEL], "pool": {}},
        ]
        for value in bad:
            with self.subTest(policy=value), self.assertRaises(ValueError):
                HELPER["validate_effective_policy"](value)

    def test_real_cli_file_to_file(self):
        # Files directly under this existing report directory avoid the known
        # ACL issue of Python-created temporary subdirectories on this host.
        prefix = Path(__file__).parent / ("core-cli-" + uuid.uuid4().hex)
        assignment = prefix.with_suffix(".txt")
        policy = prefix.with_suffix(".policy.json")
        output = prefix.with_suffix(".out.json")
        owned = [assignment, policy, output]
        try:
            assignment.write_text(json.dumps({
                "lesson_id": "core-check",
                "change": "Fix a concrete stale-value defect in the fixture lesson.",
                "scope": "Only lesson core-check; no writes outside its assigned files.",
                "acceptance": "A focused regression check proves the fix and prerequisite boundaries remain intact.",
            }), encoding="utf-8")
            def call(stage, target=output):
                return subprocess.run(
                    [sys.executable, str(SCRIPT), "--stage", stage,
                     "--lesson-id", "core-check",
                     "--assignment", str(assignment), "--policy-file", str(policy),
                     "--output", str(target)],
                    capture_output=True, text=True, encoding="utf-8", errors="replace",
                    cwd=ROOT, timeout=20,
                )
            for stage in ("2", "3"):
                for snapshot in (CANONICAL, {"effective": CANONICAL}):
                    policy.write_text(json.dumps(snapshot), encoding="utf-8")
                    completed = call(stage)
                    self.assertEqual(completed.returncode, 0, completed.stderr)
                    result = json.loads(output.read_text(encoding="utf-8"))
                    self.assertEqual(set(result), {"agent_type", "message"})
                    self.assertEqual(result["agent_type"], "pymentor_plan_worker" if stage == "2" else "pymentor_lesson_worker")
                    self.assertIn("ЕДИНСТВЕННЫЙ LESSON_ID: core-check", result["message"])
                    self.assertIn("СОДЕРЖАТЕЛЬНОЕ ИЗМЕНЕНИЕ", result["message"])
                    self.assertIn("ПРИЕМКА", result["message"])
                    self.assertIn("только при новых свидетельствах", result["message"])
            last_good = output.read_bytes()
            denied = copy.deepcopy(CANONICAL)
            denied["pool"][MODEL]["efforts"] = ["medium"]
            policy.write_text(json.dumps(denied), encoding="utf-8")
            completed = call("2")
            self.assertEqual(completed.returncode, 1)
            self.assertIn("high", completed.stderr)
            self.assertEqual(output.read_bytes(), last_good)
            luna_only = copy.deepcopy(CANONICAL)
            luna_only["pool"] = {"gpt-6-luna": {"efforts": ["high"]}}
            policy.write_text(json.dumps(luna_only), encoding="utf-8")
            completed = call("2")
            self.assertEqual(completed.returncode, 1)
            self.assertIn(MODEL, completed.stderr)
            self.assertEqual(output.read_bytes(), last_good)
            policy.write_text(json.dumps(CANONICAL), encoding="utf-8")
            before = assignment.read_bytes()
            completed = call("2", assignment)
            self.assertEqual(completed.returncode, 1)
            self.assertEqual(assignment.read_bytes(), before)
        finally:
            for path in owned:
                path.unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
