export function splitTaskPrompt(prompt: string): { description: string; examples: Array<{ input: string; output: string }> } {
  const exampleMatch = /\*\*Пример(?:ы)?:\*\*\s*([^\n]+)/i.exec(prompt);
  if (!exampleMatch) {
    return { description: prompt, examples: [] };
  }

  const examples = exampleMatch[1]
    .replace(/\.$/, "")
    .split(/;\s*/)
    .map((item) => item.trim())
    .map((item) => {
      const separatorIndex = item.indexOf("->");
      if (separatorIndex === -1) {
        return null;
      }
      return {
        input: cleanTaskExample(item.slice(0, separatorIndex)),
        output: cleanTaskExample(item.slice(separatorIndex + 2)),
      };
    })
    .filter((item): item is { input: string; output: string } => item !== null && Boolean(item.input) && Boolean(item.output));

  const description = prompt
    .replace(exampleMatch[0], "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { description, examples };
}

function cleanTaskExample(value: string): string {
  return value.trim().replace(/^`+|`+$/g, "").replace(/\.$/, "").trim();
}
