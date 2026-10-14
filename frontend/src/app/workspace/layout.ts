import { Orientation, type SerializedDockview, type SerializedGridObject } from "dockview-react";
type GroupPanelViewState = { id: string; views: string[]; activeView?: string };
export type LessonTarget = { trackId: string; lessonId: string };
export type LessonPanelKind = "theory" | "practice";
export type LayoutAccess = { authenticated: boolean; admin: boolean };
export const LESSONS_GROUP_ID = "lesson-explorer";
export const lessonPanelId = (kind: LessonPanelKind) => kind;
export const layoutKey = (owner: string, compact: boolean) => `pymentor:workspace:v2:${owner}:${compact ? "mobile" : "desktop"}`;
const legacyPanelId = (kind: LessonPanelKind, target: LessonTarget) =>
  `${kind}:${encodeURIComponent(target.trackId)}:${encodeURIComponent(target.lessonId)}`;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function dimension(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
export function isLessonTarget(value: unknown): value is LessonTarget {
  return record(value) && typeof value.trackId === "string" && value.trackId.length > 0 &&
    typeof value.lessonId === "string" && value.lessonId.length > 0;
}
export function sameLesson(left: LessonTarget | undefined, right: LessonTarget | undefined) {
  return left?.trackId === right?.trackId && left?.lessonId === right?.lessonId;
}

/** Migrate existing layouts to one linked learning pair and remove the old Dockview lessons tab. */
export function normalizeLayout(value: unknown, access: LayoutAccess, selectedTarget?: LessonTarget): SerializedDockview {
  if (!record(value) || !record(value.grid) || !record(value.panels)) throw new Error("Invalid layout");
  const { grid } = value;
  if (!dimension(grid.width) || !dimension(grid.height) ||
    (grid.orientation !== "HORIZONTAL" && grid.orientation !== "VERTICAL")) throw new Error("Invalid grid");
  if ((Array.isArray(value.floatingGroups) && value.floatingGroups.length) ||
    (Array.isArray(value.popoutGroups) && value.popoutGroups.length)) throw new Error("Unsupported layout");
  if (value.edgeGroups !== undefined && (!record(value.edgeGroups) ||
    Object.entries(value.edgeGroups).some(([position, data]) => position !== "left" && data !== undefined))) throw new Error("Unsupported edge");

  const known = new Set(Object.keys(value.panels));
  const aliases = new Map<string, string>();
  const panels: SerializedDockview["panels"] = {};
  const learning: Array<{ sourceId: string; kind: LessonPanelKind; target: LessonTarget }> = [];
  for (const [id, panel] of Object.entries(value.panels)) {
    if (!record(panel) || panel.id !== id) throw new Error("Invalid panel");
    const kind = panel.contentComponent;
    if (kind === "theory" || kind === "practice") {
      if (!isLessonTarget(panel.params) || (id !== kind && id !== legacyPanelId(kind, panel.params))) throw new Error("Invalid lesson panel");
      learning.push({ sourceId: id, kind, target: { trackId: panel.params.trackId, lessonId: panel.params.lessonId } });
    } else if (kind === "lessons" && id === "lessons") {
      // Older layouts stored the explorer as a Dockview panel. Its content is
      // restored by the activity bar now, so keep the reference for migration
      // validation without restoring it into the workspace.
    } else if (kind === "account" && id === "account") {
      if (access.authenticated) { panels[id] = { id, contentComponent: kind, title: "Личный кабинет", renderer: "always" }; aliases.set(id, id); }
    } else if (kind === "admin" && id === "admin") {
      if (access.admin) { panels[id] = { id, contentComponent: kind, title: "Админ-панель", renderer: "always" }; aliases.set(id, id); }
    } else if (kind === "interpreter" && id === "interpreter") {
      panels[id] = { id, contentComponent: kind, title: "Интерпретатор", renderer: "always" };
      aliases.set(id, id);
    } else throw new Error("Unknown panel");
  }
  const requestedActiveGroup = value.activeGroup;
  function activeView(node: unknown, depth = 0): string | undefined {
    if (!record(node) || depth > 32) return;
    if (node.type === "branch" && Array.isArray(node.data)) return node.data.map((child) => activeView(child, depth + 1)).find(Boolean);
    if (record(node.data) && node.data.id === requestedActiveGroup && typeof node.data.activeView === "string") return node.data.activeView;
  }
  const active = learning.find((panel) => panel.sourceId === activeView(grid.root));
  const target = selectedTarget ?? active?.target ?? learning.find((panel) => panel.kind === "theory")?.target ?? learning[0]?.target;
  if (target) for (const kind of ["theory", "practice"] as const) {
    const candidate = learning.find((panel) => panel.kind === kind && sameLesson(panel.target, target)) ?? learning.find((panel) => panel.kind === kind);
    if (!candidate) continue;
    aliases.set(candidate.sourceId, kind);
    panels[kind] = { id: kind, contentComponent: kind, title: kind === "theory" ? "Теория" : "Практика",
      renderer: "always", params: { trackId: target.trackId, lessonId: target.lessonId } };
  }

  const referenced = new Set<string>();
  const groups = new Set<string>();
  const retainedGroups = new Set<string>();
  function group(data: unknown, tool = false): GroupPanelViewState | null {
    if (!record(data) || typeof data.id !== "string" || !Array.isArray(data.views) || groups.has(data.id)) throw new Error("Invalid group");
    groups.add(data.id);
    const views: string[] = [];
    for (const id of data.views) {
      if (typeof id !== "string" || !known.has(id) || referenced.has(id)) throw new Error("Invalid panel reference");
      referenced.add(id);
      if (tool && id !== "lessons") throw new Error("Only lessons belong in the explorer");
      if (!tool && id === "lessons") continue;
      const canonical = aliases.get(id);
      if (canonical) views.push(canonical);
    }
    if (!views.length) return null;
    const id = tool ? LESSONS_GROUP_ID : data.id;
    if (retainedGroups.has(id)) throw new Error("Duplicate group");
    retainedGroups.add(id);
    const selected = typeof data.activeView === "string" ? aliases.get(data.activeView) : undefined;
    return { id, views, activeView: selected && views.includes(selected) ? selected : views[0] };
  }
  function visit(node: unknown, depth = 0): SerializedGridObject<GroupPanelViewState> | null {
    if (!record(node) || depth > 32 || (node.size !== undefined && !dimension(node.size))) throw new Error("Invalid node");
    if (node.type === "branch" && Array.isArray(node.data)) {
      const children = node.data.map((child) => visit(child, depth + 1)).filter((child) => child !== null);
      return children.length ? { type: "branch", data: children, size: node.size as number | undefined } : null;
    }
    if (node.type !== "leaf") throw new Error("Invalid node");
    const data = group(node.data);
    return data ? { type: "leaf", size: node.size as number | undefined, data } : null;
  }
  const root = visit(grid.root) ?? { type: "branch" as const, data: [] };
  const storedLeft = record(value.edgeGroups) ? value.edgeGroups.left : undefined;
  if (storedLeft !== undefined) {
    if (!record(storedLeft) || !dimension(storedLeft.size) || typeof storedLeft.visible !== "boolean") throw new Error("Invalid explorer");
    group(storedLeft.group, true);
  }
  if ([...known].some((id) => !referenced.has(id))) throw new Error("Unattached panel");
  const activeGroup = typeof value.activeGroup === "string" && retainedGroups.has(value.activeGroup) ? value.activeGroup : undefined;
  return { grid: { width: grid.width, height: grid.height, orientation: grid.orientation === "HORIZONTAL" ? Orientation.HORIZONTAL : Orientation.VERTICAL, root },
    panels, activeGroup };
}

export type SavedWorkspaceLayout = { layout: SerializedDockview; lessonTarget?: LessonTarget; legacy: boolean };
export function readLayout(key: string, access: LayoutAccess, preferredTarget?: LessonTarget): SavedWorkspaceLayout | null {
  try {
    const raw = localStorage.getItem(key) ?? localStorage.getItem(key.replace(":v2:", ":v1:"));
    if (!raw) return null;
    const saved: unknown = JSON.parse(raw);
    if (!record(saved) || (saved.version !== 1 && saved.version !== 2)) return null;
    const hint = preferredTarget ?? (isLessonTarget(saved.lessonTarget) ? saved.lessonTarget : undefined);
    const layout = normalizeLayout(saved.layout, access, hint);
    const params = layout.panels.theory?.params ?? layout.panels.practice?.params;
    const target = hint ?? (isLessonTarget(params) ? params : undefined);
    return { layout, lessonTarget: target ? { trackId: target.trackId, lessonId: target.lessonId } : undefined, legacy: saved.version === 1 };
  } catch { return null; }
}
export function writeLayout(key: string, layout: SerializedDockview, target?: LessonTarget) {
  try { localStorage.setItem(key, JSON.stringify({ version: 2, layout, lessonTarget: target ? { trackId: target.trackId, lessonId: target.lessonId } : undefined })); }
  catch { /* Storage is optional. */ }
}
