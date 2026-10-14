import { BookOpen, FileText, Code2, ShieldCheck, User, Terminal } from "lucide-react";
import type { WorkspaceView } from "../../features/learning";

export function WorkspaceActivityBar({
  isExplorerOpen,
  isAdmin,
  isAdminOpen,
  isAccountOpen,
  isInterpreterOpen,
  activeView,
  onOpenLessons,
  onOpenTheory,
  onOpenPractice,
  onOpenAdmin,
  onOpenAccount,
  onOpenInterpreter,
}: {
  isExplorerOpen: boolean;
  isAdmin: boolean;
  isAdminOpen: boolean;
  isAccountOpen: boolean;
  isInterpreterOpen: boolean;
  activeView?: WorkspaceView;
  onOpenLessons: () => void;
  onOpenTheory: () => void;
  onOpenPractice: () => void;
  onOpenAdmin: () => void;
  onOpenAccount: () => void;
  onOpenInterpreter: () => void;
}) {
  return (
    <aside className="activity-bar" aria-label="Навигация">
      <button
        className={`activity-button ${isExplorerOpen ? "activity-button--active" : ""}`}
        type="button"
        title="Занятия"
        aria-label={isExplorerOpen ? "Свернуть занятия" : "Открыть список занятий"}
        aria-expanded={isExplorerOpen}
        onClick={onOpenLessons}
      >
        <BookOpen size={20} />
      </button>
      <button
        className={`activity-button ${isInterpreterOpen ? "activity-button--active" : ""}`}
        type="button"
        title="Интерпретатор Python"
        aria-label="Открыть интерпретатор Python"
        onClick={onOpenInterpreter}
      >
        <Terminal size={20} />
      </button>
      <button
        className={`activity-button ${activeView === "theory" ? "activity-button--active" : ""}`}
        type="button"
        title="Теория"
        aria-label="Открыть теорию"
        onClick={onOpenTheory}
      >
        <FileText size={20} />
      </button>
      <button
        className={`activity-button ${activeView === "practice" ? "activity-button--active" : ""}`}
        type="button"
        title="Практика"
        aria-label="Открыть практику"
        onClick={onOpenPractice}
      >
        <Code2 size={20} />
      </button>
      {isAdmin && (
        <button
          className={`activity-button activity-button--bottom ${isAdminOpen ? "activity-button--active" : ""}`}
          type="button"
          title="Админ-панель"
          aria-label="Открыть админ-панель"
          onClick={onOpenAdmin}
        >
          <ShieldCheck size={20} />
        </button>
      )}
      <button
        className={`activity-button ${isAdmin ? "" : "activity-button--bottom"} ${isAccountOpen ? "activity-button--active" : ""}`}
        type="button"
        title="Личный кабинет"
        aria-label="Открыть личный кабинет"
        onClick={onOpenAccount}
      >
        <User size={20} />
      </button>
    </aside>
  );
}
