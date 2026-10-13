import React, { useCallback, useEffect, useState } from "react";
import { CalendarClock, ChevronRight, Search, ShieldCheck, User, X } from "lucide-react";
import { searchAdminAccounts } from "./api";
import { formatSubscriptionDate } from "../../shared/lib/dates";
import { AdminLearningProgress } from "./progress/AdminLearningProgress";
import { AdminStudentProfile } from "./students/AdminStudentProfile";
import { AdminSlotsView } from "./slots/AdminSlotsView";
import type { AdminAccount } from "../../shared/api/contracts";

export function AdminScreen({ onClose }: { onClose: () => void }) {
  const [adminTab, setAdminTab] = useState<"accounts" | "slots">("accounts");
  const [openStudentId, setOpenStudentId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Меняется после удаления аккаунта, чтобы список перезапросился.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    const timer = window.setTimeout(() => {
      searchAdminAccounts(search)
        .then((data) => {
          if (!cancelled) {
            setAccounts(data.users ?? []);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Не удалось загрузить аккаунты");
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, reloadKey]);

  return (
    <div className="admin-layer" role="dialog" aria-modal="true" aria-label="Админ-панель">
      <div className="admin-panel">
        <header className="admin-head">
          <div className="admin-title">
            <ShieldCheck size={20} />
            <div>
              <strong>Админ-панель</strong>
              <small>Аккаунты и подписки</small>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Закрыть">
            <X size={18} />
          </button>
        </header>

        <div className="admin-tabs">
          <button
            type="button"
            className={adminTab === "accounts" ? "is-active" : ""}
            onClick={() => setAdminTab("accounts")}
          >
            <User size={15} /> Аккаунты
          </button>
          <button
            type="button"
            className={adminTab === "slots" ? "is-active" : ""}
            onClick={() => setAdminTab("slots")}
          >
            <CalendarClock size={15} /> Слоты записи
          </button>
        </div>

        {adminTab === "slots" ? (
          <AdminSlotsView />
        ) : openStudentId !== null ? (
          <AdminStudentProfile
            studentId={openStudentId}
            onBack={() => setOpenStudentId(null)}
            onDeleted={() => {
              setOpenStudentId(null);
              setReloadKey((key) => key + 1);
            }}
          />
        ) : (
          <>
            <label className="admin-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по имени или email..."
                autoFocus
              />
            </label>

            {error && <div className="form-error">{error}</div>}

            <div className="admin-list">
              {isLoading ? (
                <p className="admin-note">Загружаем аккаунты...</p>
              ) : accounts.length === 0 ? (
                <p className="admin-note">Ничего не найдено.</p>
              ) : (
                accounts.map((account) => (
                  <button className="admin-row admin-row--clickable" key={account.id} type="button" onClick={() => setOpenStudentId(account.id)}>
                    <div className="admin-row-user">
                      <strong>
                        {account.username}
                        {account.is_admin && <span className="admin-badge">admin</span>}
                      </strong>
                      <small>{account.email}</small>
                    </div>
                    <div className="admin-row-meta">
                      <span className={account.has_active_subscription ? "is-active-subscription" : ""}>
                        {account.has_active_subscription
                          ? `подписка до ${formatSubscriptionDate(account.subscription_until)}`
                          : "подписка не активна"}
                      </span>
                      <small>{account.completed_lessons} ур. пройдено</small>
                    </div>
                    <ChevronRight size={18} className="admin-row-chevron" />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Слово, которое админ обязан ввести, чтобы удалить аккаунт.
