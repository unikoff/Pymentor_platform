import React from "react";

export function formatManualPracticeResult(result: string): string {
  // Старые и новые тексты практики могут уже включать эту подпись, а компонент
  // выводит её один раз для единообразной структуры и доступности.
  return result.replace(/^\s*готово\s*,\s*если\s*:?\s*/iu, "");
}

export function renderPracticeText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const codePattern = /```[^\n`]*\n([\s\S]*?)```|`([^`\n]+)`/g;
  let lastIndex = 0;

  for (const match of text.matchAll(codePattern)) {
    const matchIndex = match.index ?? lastIndex;
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    if (match[1] !== undefined) {
      parts.push(
        <pre className="practice-code-block" key={`block:${matchIndex}`}>
          <code>{match[1].replace(/\n$/, "")}</code>
        </pre>,
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <code className="practice-inline-code" key={`inline:${matchIndex}`}>
          {match[2]}
        </code>,
      );
    }

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex === 0) {
    return text;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
