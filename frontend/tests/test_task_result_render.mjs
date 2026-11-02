import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const stageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const frontendRoot = process.env.PYMENTOR_FRONTEND_ROOT ?? path.join(stageRoot, "frontend");
assert.ok(fs.existsSync(path.join(frontendRoot, "node_modules")), "Set PYMENTOR_FRONTEND_ROOT to the local frontend checkout");
const requireFromFrontend = createRequire(path.join(frontendRoot, "package.json"));
const ts = requireFromFrontend("typescript");
const React = requireFromFrontend("react");
const { renderToStaticMarkup } = requireFromFrontend("react-dom/server");

const componentPath = path.join(
  stageRoot,
  "frontend/src/features/learning/practice/TaskResult.tsx",
);
const learningView = fs.readFileSync(
  path.join(stageRoot, "frontend/src/features/learning/practice/LearningPracticeView.tsx"),
  "utf8",
);
const taskRunner = fs.readFileSync(
  path.join(stageRoot, "frontend/src/features/learning/practice/TaskRunner.tsx"),
  "utf8",
);
assert.match(learningView, /typeof sourceFile !== "string" \|\| !sourceFile\.trim\(\) \|\| sourceFile\.startsWith\("chapter_01\/"\)/s);
assert.match(learningView, /isSafeSubmitFeedback=\{isSafeSubmitFeedback\}/);
assert.match(taskRunner, /TaskResult result=\{result\} isSafeSubmitFeedback=\{isSafeSubmitFeedback\}/);

const source = fs.readFileSync(componentPath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const componentModule = { exports: {} };
new Function("require", "module", "exports", transpiled)(
  requireFromFrontend,
  componentModule,
  componentModule.exports,
);
const { TaskResult } = componentModule.exports;

function render(result, isSafeSubmitFeedback) {
  return renderToStaticMarkup(
    React.createElement(TaskResult, { result, isSafeSubmitFeedback }),
  );
}

const chapterOneMismatch = render({
  ok: false,
  score: 25,
  tests: [{
    name: "Проверка 1",
    passed: false,
    error: "Одна из проверок не пройдена. Сверьте решение с условием задачи.",
  }],
}, true);
assert.match(chapterOneMismatch, /Решение не прошло проверку/);
assert.match(chapterOneMismatch, /Одна из проверок не пройдена/);
assert.doesNotMatch(chapterOneMismatch, /Выполнение прервано/);
assert.doesNotMatch(chapterOneMismatch, /Ожидается|Получено/);

const chapterOneError = render({
  ok: false,
  score: 0,
  tests: [],
  error: "Не удалось проверить решение. Проверьте код и попробуйте ещё раз.",
}, true);
assert.match(chapterOneError, /Проверка не выполнена/);
assert.match(chapterOneError, /Не удалось проверить решение/);
assert.doesNotMatch(chapterOneError, /Ошибка в коде/);

const invalidMetadataError = render({
  ok: false,
  score: 0,
  tests: [],
  error: "Не удалось проверить решение. Проверьте код и попробуйте ещё раз.",
}, true);
assert.match(invalidMetadataError, /Проверка не выполнена/);
assert.match(invalidMetadataError, /Не удалось проверить решение/);

const legacySuccess = render({ ok: true, score: 100, tests: [] }, false);
assert.match(legacySuccess, /Задание принято/);

const legacyMismatch = render({
  ok: false,
  score: 0,
  tests: [{ name: "legacy test", passed: false, expected: "expected", actual: "actual" }],
}, false);
assert.match(legacyMismatch, /Нужно доработать/);
assert.match(legacyMismatch, /Ожидалось/);
assert.match(legacyMismatch, /Получено/);

const legacyError = render({
  ok: false,
  score: 0,
  tests: [{ name: "legacy test", passed: false, error: "ValueError: legacy failure" }],
  error: "ValueError: legacy failure",
}, false);
assert.match(legacyError, /Ошибка в коде/);
assert.match(legacyError, /Выполнение прервано: ValueError: legacy failure/);

console.log("TaskResult SSR checks passed: chapter_01 safe feedback; legacy success/mismatch/error retained.");
