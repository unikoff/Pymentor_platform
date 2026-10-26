"""Parse lesson Markdown and legacy embedded practice fences."""

from __future__ import annotations
import re
import json
from pathlib import Path
from typing import Any


YOUTUBE_MARKER_RE = re.compile(r"<!--\s*youtube\s*:\s*(.*?)\s*-->", re.IGNORECASE | re.DOTALL)


YOUTUBE_URL_RE = re.compile(
    r"(?:youtu\.be/|youtube(?:-nocookie)?\.com/(?:watch\?[^#\s]*?v=|embed/|shorts/|live/))([A-Za-z0-9_-]{11})",
    re.IGNORECASE,
)


HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")


CODE_FENCE_RE = re.compile(r"^```")


TASK_MARKERS = ("домашнее задание", "контрольная точка", "практика для автопроверки")


TASK_TITLE_RE = re.compile(r"^задача\s*\d*\.?\s*(.*)$", re.IGNORECASE)


TESTS_FENCE_RE = re.compile(r"```tests\s*\n(.*?)```", re.DOTALL)


STARTER_FENCE_RE = re.compile(r"```starter\s*\n(.*?)```", re.DOTALL)


PYTHON_FENCE_RE = re.compile(r"```python\s*\n(.*?)```", re.DOTALL)


def _clean_markdown(text: str) -> str:
    text = text.replace("[[", "").replace("]]", "")
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _normalise_heading(text: str) -> str:
    text = _clean_markdown(text)
    text = re.sub(r"^Урок\s*:\s*", "", text, flags=re.IGNORECASE)
    return text.strip(" -")


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def _strip_generated_task_dump(text: str) -> str:
    return text.split("\n## Tasks for compiler", 1)[0]


def _extract_youtube_video(text: str, title: str) -> dict[str, str] | None:
    """Read a YouTube URL from the lesson marker at the end of Markdown."""
    marker_match = YOUTUBE_MARKER_RE.search(text)
    if marker_match is None:
        return None

    url_match = YOUTUBE_URL_RE.search(marker_match.group(1))
    if url_match is None:
        return None

    youtube_id = url_match.group(1)
    return {
        "title": f"Видео к занятию: {title}",
        "youtube_id": youtube_id,
        "embed_url": f"https://www.youtube.com/embed/{youtube_id}",
    }


def _strip_service_fences(text: str) -> str:
    """Убирает из markdown сервисные блоки ```tests и ```starter — студент их видеть не должен."""
    text = TESTS_FENCE_RE.sub("", text)
    text = STARTER_FENCE_RE.sub("", text)
    text = YOUTUBE_MARKER_RE.sub("", text)
    return text.strip()


def _split_paragraphs(text: str) -> list[str]:
    paragraphs: list[str] = []
    buffer: list[str] = []
    in_code = False

    for raw_line in text.splitlines():
        stripped = raw_line.strip()

        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue
        if HEADING_RE.match(stripped):
            if buffer:
                paragraphs.append(_clean_markdown(" ".join(buffer)))
                buffer = []
            continue
        if not stripped or stripped == "---":
            if buffer:
                paragraphs.append(_clean_markdown(" ".join(buffer)))
                buffer = []
            continue

        item = stripped.lstrip("-*0123456789. ").strip()
        if item:
            buffer.append(item)

    if buffer:
        paragraphs.append(_clean_markdown(" ".join(buffer)))

    return [paragraph for paragraph in paragraphs if paragraph]


def _extract_intro_theory(text: str) -> list[str]:
    text = YOUTUBE_MARKER_RE.sub("", text)
    before_tasks = re.split(r"\n##\s+.*?(?:Домашнее задание|Практика).*?\n", text, maxsplit=1, flags=re.IGNORECASE)
    paragraphs = _split_paragraphs(before_tasks[0])
    return paragraphs[:5] or ["Материал урока скоро будет расширен."]


def _extract_title(path: Path, text: str) -> str:
    for raw_line in text.splitlines():
        match = HEADING_RE.match(raw_line.strip())
        if match:
            return _normalise_heading(match.group(2))
    return _normalise_heading(path.stem)


def _compute_fence_mask(lines: list[str]) -> list[bool]:
    """True для строк внутри код-фенсов (включая сами ```): их нельзя считать заголовками.

    Иначе комментарий вида `# удалите "dog"` внутри ```starter обрывает блок задания.
    """
    mask: list[bool] = []
    fenced = False
    for line in lines:
        if CODE_FENCE_RE.match(line.strip()):
            mask.append(True)
            fenced = not fenced
        else:
            mask.append(fenced)
    return mask


def _extract_task_blocks(text: str) -> list[tuple[str, str]]:
    lines = text.splitlines()
    fence_mask = _compute_fence_mask(lines)
    headings: list[tuple[int, int, str]] = []
    for index, line in enumerate(lines):
        match = None if fence_mask[index] else HEADING_RE.match(line.strip())
        if match:
            headings.append((index, len(match.group(1)), _normalise_heading(match.group(2))))

    blocks: list[tuple[str, str]] = []
    for section_index, (start_index, section_level, section_title) in enumerate(headings):
        if not any(marker in section_title.lower() for marker in TASK_MARKERS):
            continue

        section_end = len(lines)
        for next_index, next_level, _ in headings[section_index + 1 :]:
            if next_level <= section_level:
                section_end = next_index
                break

        section_headings = [heading for heading in headings if start_index < heading[0] < section_end]
        for task_position, (task_index, task_level, task_title) in enumerate(section_headings):
            task_match = TASK_TITLE_RE.match(task_title)
            if task_match is None:
                continue

            task_end = section_end
            for next_index, next_level, _ in section_headings[task_position + 1 :]:
                if next_level <= task_level:
                    task_end = next_index
                    break

            title = task_match.group(1).strip() or task_title
            block = "\n".join(lines[task_index + 1 : task_end]).strip()
            if block:
                blocks.append((title, block))

    return blocks


def _extract_task_prompt(block_text: str) -> str:
    prompt_lines: list[str] = []
    in_code = False

    for raw_line in block_text.splitlines():
        stripped = raw_line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code or not stripped:
            continue
        if stripped == "---":
            continue
        prompt_lines.append(stripped)

    prompt = "\n".join(prompt_lines).strip()
    return prompt or "Выполните практическое задание из урока."


def _starter_code() -> str:
    return "def solve(*args):\n    # Напишите решение здесь\n    pass\n"


def _extract_tests_from_block(block: str) -> tuple[list[dict[str, Any]], str]:
    """Вынимает из блока задания сервисный fenced-блок ```tests с JSON-тестами.

    Формат в .md (внутри секции «Домашнее задание» / «Контрольная точка»):

        ```tests
        [
          {"name": "пример", "args": [1, 2], "expected": 3},
          {"name": "вывод", "args": [5], "expected": "5", "assert": "stdout"}
        ]
        ```

    Возвращает (tests, block_без_этого_фрагмента).
    """
    tests: list[dict[str, Any]] = []

    def _consume(match: re.Match[str]) -> str:
        try:
            parsed = json.loads(match.group(1))
        except json.JSONDecodeError:
            return match.group(0)
        if isinstance(parsed, list):
            tests.extend(item for item in parsed if isinstance(item, dict))
            return ""
        return match.group(0)

    cleaned = TESTS_FENCE_RE.sub(_consume, block)
    return tests, cleaned


def _extract_starter_from_block(block: str) -> tuple[str | None, str]:
    """Вынимает сервисный fenced-блок ```starter с шаблоном кода для студента."""
    starter: str | None = None

    def _consume(match: re.Match[str]) -> str:
        nonlocal starter
        if starter is None:
            starter = match.group(1).rstrip() + "\n"
        return ""

    cleaned = STARTER_FENCE_RE.sub(_consume, block)
    return starter, cleaned


def _extract_python_starter_from_block(block: str) -> str | None:
    for match in PYTHON_FENCE_RE.finditer(block):
        candidate = match.group(1).strip()
        if re.search(r"^def\s+solve\s*\(", candidate, flags=re.MULTILINE):
            return candidate + "\n"
    return None
