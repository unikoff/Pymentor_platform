import "./dashboard.css";
import { useEffect, useState } from "react";
import { BookCheck, CalendarClock, ChevronRight, Search, ShieldCheck, User, UsersRound } from "lucide-react";
import { searchAdminAccounts } from "./api";
import { formatSubscriptionDate } from "../../shared/lib/dates";
import { lazyNamed } from "../../shared/ui/async-boundary/lazyNamed";
import { AsyncBoundary } from "../../shared/ui/async-boundary/AsyncBoundary";
import type { AdminAccount } from "../../shared/api/contracts";
const AdminStudentProfile = lazyNamed(() => import("./students/AdminStudentProfile"), "AdminStudentProfile");
const AdminSlotsView = lazyNamed(() => import("./slots/AdminSlotsView"), "AdminSlotsView");

function formatAccountCount(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const noun = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "аккаунтов"
    : lastDigit === 1
      ? "аккаунт"
      : lastDigit >= 2 && lastDigit <= 4
        ? "аккаунта"
        : "аккаунтов";

  return `${count.toLocaleString("ru-RU")} ${noun}`;
}
export function AdminScreen() {
  const [adminTab, setAdminTab] = useState<"accounts" | "slots">("accounts");
  const [openStudentId, setOpenStudentId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Меняется после удаления аккаунта, чтобы список перезапросился.
  const [reloadKey, setReloadKey] = useState(0);
  const activeSubscriptions = accounts.filter((account) => account.has_active_subscription).length;
  const completedLessons = accounts.reduce((total, account) => total + account.completed_lessons, 0);

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
      <section className="admin-panel" aria-label="Админ-панель">
        <header className="admin-head">
          <div className="admin-title">
            <span className="admin-title-icon"><ShieldCheck size={21} /></span>
            <div>
              <span className="admin-eyebrow">УПРАВЛЕНИЕ ПЛАТФОРМОЙ</span>
              <h1>Админ-панель</h1>
              <p>Аккаунты, обучение и расписание занятий — в одном месте.</p>
            </div>
          </div>
        </header>

        {adminTab === "accounts" && openStudentId === null && (
          <div className="admin-summary" aria-label="Сводка по аккаунтам">
            <section className="admin-summary-card">
              <span className="admin-summary-icon"><UsersRound size={17} /></span>
              <div><small>Аккаунтов в выборке</small><strong>{isLoading ? "—" : accounts.length.toLocaleString("ru-RU")}</strong></div>
            </section>
            <section className="admin-summary-card">
              <span className="admin-summary-icon"><ShieldCheck size={17} /></span>
              <div><small>Активная подписка</small><strong>{isLoading ? "—" : activeSubscriptions.toLocaleString("ru-RU")}</strong></div>
            </section>
            <section className="admin-summary-card">
              <span className="admin-summary-icon"><BookCheck size={17} /></span>
              <div><small>Пройдено уроков</small><strong>{isLoading ? "—" : completedLessons.toLocaleString("ru-RU")}</strong></div>
            </section>
          </div>
        )}

        <div className="admin-tabs">
          <button
            type="button"
            className={adminTab === "accounts" ? "is-active" : ""}
            aria-pressed={adminTab === "accounts"}
            onClick={() => setAdminTab("accounts")}
          >
            <User size={15} /> Аккаунты
          </button>
          <button
            type="button"
            className={adminTab === "slots" ? "is-active" : ""}
            aria-pressed={adminTab === "slots"}
            onClick={() => setAdminTab("slots")}
          >
            <CalendarClock size={15} /> Слоты записи
          </button>
        </div>

        {adminTab === "slots" ? (
          <>
            <div className="admin-section-heading">
              <div>
                <h2>Расписание занятий</h2>
                <p>Создавайте свободные окна и управляйте записями учеников.</p>
              </div>
            </div>
            <AsyncBoundary><AdminSlotsView /></AsyncBoundary>
          </>
        ) : openStudentId !== null ? (
          <AsyncBoundary key={openStudentId}><AdminStudentProfile
            studentId={openStudentId}
            onBack={() => setOpenStudentId(null)}
            onDeleted={() => {
              setOpenStudentId(null);
              setReloadKey((key) => key + 1);
            }}
          /></AsyncBoundary>
        ) : (
          <>
            <div className="admin-section-heading">
              <div>
                <h2>Пользователи</h2>
                <p>Управляйте доступом, подписками и прогрессом обучения.</p>
              </div>
              <span className="admin-result-count">{isLoading ? "Загрузка" : formatAccountCount(accounts.length)}</span>
            </div>
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

            <div className="admin-list" aria-live="polite">
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
      </section>
  );
}
