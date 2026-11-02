import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const stageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const frontendRoot = process.env.PYMENTOR_FRONTEND_ROOT ?? path.join(stageRoot, "frontend");
if (!fs.existsSync(path.join(frontendRoot, "node_modules"))) {
  throw new Error("Set PYMENTOR_FRONTEND_ROOT to the local frontend checkout");
}
const requireFromFrontend = createRequire(path.join(frontendRoot, "package.json"));
const ts = requireFromFrontend("typescript");
const tsconfigPath = path.join(frontendRoot, "config/tsconfig.json");
const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath));

const relativeFiles = [
  "features/learning/practice/LearningPracticeView.tsx",
  "features/learning/practice/TaskRunner.tsx",
  "features/learning/practice/TaskResult.tsx",
  "features/learning/types.ts",
];
const overrides = new Map(relativeFiles.map((relative) => [
  path.resolve(frontendRoot, "src", relative),
  path.join(stageRoot, "frontend/src", relative),
]));
const host = ts.createCompilerHost(config.options);
const originalReadFile = host.readFile.bind(host);
host.readFile = (fileName) => {
  const candidate = overrides.get(path.resolve(fileName));
  return candidate ? fs.readFileSync(candidate, "utf8") : originalReadFile(fileName);
};
const originalGetSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
  const candidate = overrides.get(path.resolve(fileName));
  if (candidate) {
    return ts.createSourceFile(
      fileName,
      fs.readFileSync(candidate, "utf8"),
      languageVersion,
      true,
    );
  }
  return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
};

const rootNames = [...overrides.keys(), path.join(frontendRoot, "src/vite-env.d.ts")];
const program = ts.createProgram(rootNames, config.options, host);
const candidatePaths = new Set([...overrides.keys()].map((fileName) => path.resolve(fileName)));
const diagnostics = ts.getPreEmitDiagnostics(program).filter(
  (diagnostic) => diagnostic.file && candidatePaths.has(path.resolve(diagnostic.file.fileName)),
);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: (fileName) => fileName,
    getNewLine: () => "\n",
  }));
  process.exit(1);
}
console.log("TypeScript candidate checks passed for LearningPracticeView, TaskRunner, TaskResult, and types.");
