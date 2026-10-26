import "./dashboard.css";
import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CalendarDays, ChevronRight, LayoutDashboard, ShieldCheck, User } from "lucide-react";
import { searchAdminAccounts } from "./api";
import { formatSubscriptionDate, getInitialCalendarMonth } from "../../shared/lib/dates";
import { AdminAccountFilters } from "./accounts/AdminAccountFilters";
import type { AdminAccountFilters as AccountFilters } from "../../shared/api/contracts/admin";
import { lazyNamed } from "../../shared/ui/async-boundary/lazyNamed";
import { AsyncBoundary } from "../../shared/ui/async-boundary/AsyncBoundary";
import type { AdminAccount } from "../../shared/api/contracts";
const AdminStudentProfile = lazyNamed(() => import("./students/AdminStudentProfile"), "AdminStudentProfile");
const AdminSlotsView = lazyNamed(() => import("./slots/AdminSlotsView"), "AdminSlotsView");
const AdminCalendarView = lazyNamed(() => import("./calendar/AdminCalendarView"), "AdminCalendarView");
const AdminOverviewDashboard = lazyNamed(() => import("./overview/AdminOverviewDashboard"), "AdminOverviewDashboard");

function formatAdminSubscriptionExpiry(value?: string | null) {
  return formatSubscriptionDate(value).match(/^(\d{2}\.\d{2})\./)?.[1] ?? "—";
}

function formatAdminPeriodStart(value: string) {
  const [, month, day] = value.match(/^\d{4}-(\d{2})-(\d{2})$/) ?? [];
  return day && month ? `${day}.${month}` : "—";
}

function formatSubscriptionPlan(value?: string | null) {
  const plan = value?.trim() || "pro";
  return plan.charAt(0).toLocaleUpperCase("ru-RU") + plan.slice(1);
}

export function AdminScreen() {
  const [adminTab, setAdminTab] = useState<"overview" | "accounts" | "slots" | "calendar">("overview");
  const [openStudentId, setOpenStudentId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AccountFilters>({ subscription: "all", lessons: "all" });
  const [quotaMonth] = useState(getInitialCalendarMonth);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [completedSince, setCompletedSince] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Меняется после удаления аккаунта, чтобы список перезапросился.
  const [reloadKey, setReloadKey] = useState(0);
  const openStudent = useCallback((studentId: number) => {
    setOpenStudentId(studentId);
    setAdminTab("accounts");
  }, []);

  useEffect(() => {
    if (adminTab !== "accounts" || openStudentId !== null) return;

    let cancelled = false;
    setIsLoading(true);
    setError("");
    setAccounts([]);
    setCompletedSince("");

    const timer = window.setTimeout(() => {
      searchAdminAccounts(search, filters, quotaMonth)
        .then((data) => {
          if (!cancelled) {
            setAccounts(data.users ?? []);
            setCompletedSince(data.completed_since ?? "");
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
  }, [adminTab, openStudentId, search, filters.subscription, filters.lessons, quotaMonth, reloadKey]);

  return (
      <section className="admin-panel" aria-label="Админ-панель">
        <header className="admin-head">
          <div className="admin-title">
            <span className="admin-title-icon"><ShieldCheck size={21} /></span>
            <div>
              <h1>Админ-панель</h1>
              <p>Аккаунты, подписки и расписание занятий.</p>
            </div>
          </div>
        </header>

        <div className="admin-tabs">
          <button
            type="button"
            className={adminTab === "overview" ? "is-active" : ""}
            aria-pressed={adminTab === "overview"}
            onClick={() => { setAdminTab("overview"); setOpenStudentId(null); }}
          >
            <LayoutDashboard size={15} /> Обзор
          </button>
          <button
            type="button"
            className={adminTab === "accounts" ? "is-active" : ""}
            aria-pressed={adminTab === "accounts"}
            onClick={() => { setAdminTab("accounts"); setOpenStudentId(null); }}
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
          <button type="button" className={adminTab === "calendar" ? "is-active" : ""}
            aria-pressed={adminTab === "calendar"} onClick={() => setAdminTab("calendar")}>
            <CalendarDays size={15} /> Календарь
          </button>
        </div>

        {adminTab === "overview" ? (
          <AsyncBoundary><AdminOverviewDashboard onOpenStudent={openStudent} /></AsyncBoundary>
        ) : adminTab === "calendar" ? (
          <AsyncBoundary><AdminCalendarView onOpenStudent={openStudent} /></AsyncBoundary>
        ) : adminTab === "slots" ? (
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
            onBack={() => { setOpenStudentId(null); setReloadKey((key) => key + 1); }}
            onDeleted={() => {
              setOpenStudentId(null);
              setReloadKey((key) => key + 1);
            }}
          /></AsyncBoundary>
        ) : (
          <>
            <AdminAccountFilters search={search} filters={filters} month={quotaMonth}
              onSearch={setSearch} onChange={setFilters} />

            {error && <div className="form-error" role="alert">{error}</div>}

            <div className="admin-list" aria-live="polite">
              {isLoading ? (
                <p className="admin-note">Загружаем аккаунты...</p>
              ) : error ? null : accounts.length === 0 ? (
                <p className="admin-note">Ничего не найдено.</p>
              ) : (
                <>
                  <div className="admin-list-header" aria-hidden="true">
                    <span className="admin-list-header__account">Аккаунт</span>
                    <span>Подписка</span>
                    <span>Пройдено с {formatAdminPeriodStart(completedSince)}</span>
                    <span>Остаток</span>
                    <span aria-hidden="true" />
                  </div>
                  {accounts.map((account) => (
                    <button className="admin-row admin-row--clickable" key={account.id} type="button" onClick={() => setOpenStudentId(account.id)}>
                      <div className="admin-row-user">
                        <strong>
                          {account.username}
                          {account.is_admin && <span className="admin-badge">admin</span>}
                        </strong>
                        <small>{account.email}</small>
                      </div>
                      <span className={`admin-row-meta admin-row__subscription ${account.has_active_subscription ? "is-active-subscription" : "is-no-subscription"}`}
                        data-label="Подписка"
                        aria-label={account.has_active_subscription
                          ? `Подписка ${formatSubscriptionPlan(account.subscription_plan)} до ${formatSubscriptionDate(account.subscription_until)}`
                          : "Нет действующей подписки"}>
                        {account.has_active_subscription
                          ? `${formatSubscriptionPlan(account.subscription_plan)} · ${formatAdminSubscriptionExpiry(account.subscription_until)}`
                          : "—"}
                      </span>
                      <span className="admin-row-completed" data-label="Пройдено"
                        aria-label={`${account.completed_lessons_7d} уроков пройдено с ${formatAdminPeriodStart(completedSince)}`}>
                        {account.completed_lessons_7d}
                      </span>
                      <span className={`admin-row-quota ${account.quota?.remaining === 0 ? "is-empty" : ""}`}
                        data-label="Остаток"
                        aria-label={`${account.quota?.remaining ?? "Нет данных"} занятий осталось`}>
                        {account.quota?.remaining ?? "—"}
                      </span>
                      <ChevronRight size={18} className="admin-row-chevron" />
                    </button>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </section>
  );
}
