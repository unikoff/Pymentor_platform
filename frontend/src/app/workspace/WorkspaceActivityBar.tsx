import { BookOpen, Code2, ShieldCheck, User } from "lucide-react";
import type { WorkspaceView } from "../../features/learning/types";

export function WorkspaceActivityBar({
  isExplorerOpen,
  isAdmin,
  isAdminOpen,
  activeView,
  onOpenLessons,
  onOpenPractice,
  onOpenAdmin,
  onOpenAccount,
}: {
  isExplorerOpen: boolean;
  isAdmin: boolean;
  isAdminOpen: boolean;
  activeView: WorkspaceView;
  onOpenLessons: () => void;
  onOpenPractice: () => void;
  onOpenAdmin: () => void;
  onOpenAccount: () => void;
}) {
  return (
    <aside className="activity-bar" aria-label="Навигация">
      <button
        className={`activity-button ${isExplorerOpen ? "activity-button--active" : ""}`}
        type="button"
        title="Курс"
        aria-label="Открыть список занятий"
        onClick={onOpenLessons}
      >
        <BookOpen size={20} />
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
        className={`activity-button ${isAdmin ? "" : "activity-button--bottom"}`}
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
