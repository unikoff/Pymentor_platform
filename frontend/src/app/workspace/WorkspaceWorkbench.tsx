import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { DockviewReact, themeDark, themeLight, type DockviewApi, type DockviewReadyEvent, type IDockviewPanelHeaderProps, type SerializedDockview } from "dockview-react";
import { X } from "lucide-react";
import { useTheme } from "../../shared/theme";
import { workspacePanels } from "./WorkspacePanels";
import { isLessonTarget, layoutKey, lessonPanelId, normalizeLayout, readLayout, sameLesson, writeLayout, type LessonPanelKind, type LessonTarget } from "./layout";

export type WorkspaceCommands = {
  openAccount: () => void;
  openAdmin: () => void;
  openInterpreter: () => void;
  openLesson: (kind: LessonPanelKind, target: LessonTarget) => void;
};
export type ActiveWorkspacePanel = { id: string; kind?: LessonPanelKind; target?: LessonTarget };

function DockTab({ api }: IDockviewPanelHeaderProps) {
  const [title, setTitle] = useState(api.title ?? "");
  useEffect(() => {
    setTitle(api.title ?? "");
    const subscription = api.onDidTitleChange((event) => setTitle(event.title ?? ""));
    return () => subscription.dispose();
  }, [api]);
  const close = () => api.close();
  return <div className="dock-tab" title={title}>
    <button id={`dock-tab-${api.id}`} className="dock-tab-main" type="button" onClick={() => api.setActive()}
      onKeyDown={(event) => {
        if (event.key === "Delete") { event.preventDefault(); close(); return; }
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const panels = api.group.panels;
        const index = panels.findIndex((panel) => panel.id === api.id);
        const next = panels[(index + (event.key === "ArrowRight" ? 1 : -1) + panels.length) % panels.length];
        next?.api.setActive();
        if (next) document.getElementById(`dock-tab-${next.id}`)?.focus();
      }}>{title}</button>
    <button className="dock-tab-close" type="button" aria-label={`Закрыть ${title}`}
      onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); close(); }}>
      <X size={14} aria-hidden="true" />
    </button>
  </div>;
}

export function WorkspaceWorkbench({ ownerKey, isAuthenticated, isAdmin, compact, ready, initialLesson, selectedLesson, commands, onActivePanel, onLessonChange, onOpenLessons }: {
  ownerKey: string; isAuthenticated: boolean; isAdmin: boolean; compact: boolean; ready: boolean;
  initialLesson?: LessonTarget; selectedLesson?: LessonTarget; commands: MutableRefObject<WorkspaceCommands | null>;
  onActivePanel: (panel?: ActiveWorkspacePanel) => void;
  onLessonChange: (target?: LessonTarget) => void;
  onOpenLessons: () => void;
}) {
  const { colorScheme } = useTheme();
  const [api, setApi] = useState<DockviewApi>();
  const [workspaceCount, setWorkspaceCount] = useState(0);
  const initialized = useRef<DockviewApi>();
  const currentTarget = useRef<LessonTarget>();
  const snapshot = useRef<SerializedDockview>();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const key = layoutKey(ownerKey, compact);
  const access = useMemo(() => ({ authenticated: isAuthenticated, admin: isAdmin }), [isAuthenticated, isAdmin]);
  const onReady = useCallback((event: DockviewReadyEvent) => setApi(event.api), []);
  const openLesson = useCallback((kind: LessonPanelKind, target: LessonTarget) => {
    if (!api) return;
    const binding = { trackId: target.trackId, lessonId: target.lessonId };
    currentTarget.current = binding;
    onLessonChange(binding);
    for (const view of ["theory", "practice"] as const) {
      const panel = api.getPanel(view);
      if (panel && !sameLesson(isLessonTarget(panel.params) ? panel.params : undefined, binding)) {
        panel.api.setTitle(view === "theory" ? "Теория" : "Практика");
        panel.api.updateParameters(binding);
      }
    }
    const existing = api.getPanel(lessonPanelId(kind));
    if (existing) existing.api.setActive();
    else {
      const reference = api.activePanel?.api.location.type === "grid" ? api.activePanel : api.panels.find((panel) => panel.api.location.type === "grid");
      api.addPanel({ id: lessonPanelId(kind), component: kind, title: kind === "theory" ? "Теория" : "Практика", params: binding, renderer: "always",
        position: reference ? { referencePanel: reference, direction: "within" } : { direction: "right" } });
    }
  }, [api, onLessonChange]);

  const openSingleton = useCallback((kind: "account" | "admin") => {
    if (!api || (kind === "account" && !isAuthenticated) || (kind === "admin" && !isAdmin)) return;
    const existing = api.getPanel(kind);
    if (existing) existing.api.setActive();
    else {
      const reference = api.activePanel?.api.location.type === "grid" ? api.activePanel : api.panels.find((panel) => panel.api.location.type === "grid");
      api.addPanel({ id: kind, component: kind, title: kind === "account" ? "Личный кабинет" : "Админ-панель", renderer: "always",
        position: reference ? { referencePanel: reference, direction: "within" } : { direction: "right" } });
    }
  }, [api, isAuthenticated, isAdmin]);

  const openInterpreter = useCallback(() => {
    if (!api) return;
    const existing = api.getPanel("interpreter");
    if (existing) existing.api.setActive();
    else {
      const reference = api.activePanel?.api.location.type === "grid" ? api.activePanel : api.panels.find((panel) => panel.api.location.type === "grid");
      api.addPanel({ id: "interpreter", component: "interpreter", title: "Интерпретатор", renderer: "always",
        position: reference ? { referencePanel: reference, direction: "within" } : { direction: "right" } });
    }
  }, [api]);

  const defaults = useCallback(() => {
    if (!api) return;
    api.clear();
    const target = currentTarget.current ?? selectedLesson ?? initialLesson;
    if (target) {
      openLesson("theory", target);
      openLesson("practice", target);
      api.getPanel("theory")?.api.setActive();
    }
  }, [api, initialLesson?.trackId, initialLesson?.lessonId, selectedLesson?.trackId, selectedLesson?.lessonId, openLesson]);

  useEffect(() => {
    if (!api) return;
    const updateWorkspaceCount = () => setWorkspaceCount(
      api.groups.filter((group) => group.api.location.type === "grid").length,
    );
    updateWorkspaceCount();
    const added = api.onDidAddGroup(updateWorkspaceCount);
    const removed = api.onDidRemoveGroup(updateWorkspaceCount);
    const layout = api.onDidLayoutChange(updateWorkspaceCount);
    return () => {
      added.dispose();
      removed.dispose();
      layout.dispose();
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const report = () => {
      const panel = api.activePanel;
      const kind = panel?.id === "theory" || panel?.id === "practice" ? panel.id : undefined;
      onActivePanel(panel ? { id: panel.id, kind, target: kind && isLessonTarget(panel.params) ? { trackId: panel.params.trackId, lessonId: panel.params.lessonId } : undefined } : undefined);
    };
    const active = api.onDidActivePanelChange(report);
    const layout = api.onDidLayoutChange(() => {
      report();
      if (initialized.current !== api) return;
      snapshot.current = normalizeLayout(api.toJSON(), access, currentTarget.current);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => { if (snapshot.current) writeLayout(key, snapshot.current, currentTarget.current); }, 500);
    });
    const pageHide = () => {
      clearTimeout(timer.current);
      if (initialized.current === api) snapshot.current = normalizeLayout(api.toJSON(), access, currentTarget.current);
      if (snapshot.current) writeLayout(key, snapshot.current, currentTarget.current);
    };
    window.addEventListener("pagehide", pageHide);
    report();
    return () => {
      [active, layout].forEach((subscription) => subscription.dispose());
      window.removeEventListener("pagehide", pageHide);
      clearTimeout(timer.current);
      if (snapshot.current) writeLayout(key, snapshot.current, currentTarget.current);
    };
  }, [api, key, access, onActivePanel]);

  useEffect(() => {
    if (!api || !ready || initialized.current === api) return;
    const saved = readLayout(key, access, selectedLesson);
    try {
      if (saved) {
        api.fromJSON(saved.layout);
        currentTarget.current = saved.lessonTarget;
        onLessonChange(saved.lessonTarget);
      } else defaults();
    } catch { defaults(); }
    if (compact) {
      const gridGroups = api.groups.filter((group) => group.api.location.type === "grid");
      const destination = gridGroups[0];
      if (destination) api.panels.forEach((panel) => {
        if (panel.group !== destination) panel.api.moveTo({ group: destination, position: "center" });
      });
    }
    initialized.current = api;
    snapshot.current = normalizeLayout(api.toJSON(), access, currentTarget.current);
    writeLayout(key, snapshot.current, currentTarget.current);
  }, [api, ready, key, access, selectedLesson?.trackId, selectedLesson?.lessonId, defaults, compact, onLessonChange]);

  useEffect(() => {
    if (!api) return;
    if (!isAdmin) api.getPanel("admin")?.api.close();
    if (!isAuthenticated) api.getPanel("account")?.api.close();
  }, [api, isAdmin, isAuthenticated, compact]);

  useEffect(() => {
    if (!api) return;
    commands.current = { openAccount: () => openSingleton("account"), openAdmin: () => openSingleton("admin"), openInterpreter, openLesson };
    return () => { commands.current = null; };
  }, [api, commands, openSingleton, openInterpreter, openLesson]);

  const Watermark = useMemo(() => function EmptyWorkspace() {
    return <div className="empty-workbench"><div><h2>Рабочая область свободна</h2><p>Откройте теорию или практику выбранного занятия.</p>
      <button className="secondary-action" type="button" onClick={() => currentTarget.current ? openLesson("theory", currentTarget.current) : onOpenLessons()}>Открыть материал</button></div></div>;
  }, [openSingleton, openLesson, onOpenLessons]);
  return <section className={`dock-workbench ${workspaceCount === 1 ? "dock-workbench--single-workspace" : ""}`} aria-label="Рабочая область">
    <DockviewReact className="pymentor-dock" theme={colorScheme === "dark" ? themeDark : themeLight}
      components={workspacePanels} defaultTabComponent={DockTab} watermarkComponent={Watermark} onReady={onReady}
      disableFloatingGroups dndStrategy="pointer" disableDnd={compact} dndEdges={compact ? false : undefined}
      getTabContextMenuItems={() => ["close", "closeOthers", "closeAll"]}
      onWillDrop={(event) => { if (compact) event.preventDefault(); }} />
  </section>;
}
