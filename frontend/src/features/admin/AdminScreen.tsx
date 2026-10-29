import "./admin.css";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, CalendarDays, ChevronRight, LayoutDashboard, User } from "lucide-react";
import { searchAdminAccounts } from "./api";
import { formatSubscriptionDate, getInitialCalendarMonth, getMonthTitle } from "../../shared/lib/dates";
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

function formatAccountCount(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  const noun = lastTwo >= 11 && lastTwo <= 14 ? "аккаунтов"
    : last === 1 ? "аккаунт"
      : last >= 2 && last <= 4 ? "аккаунта" : "аккаунтов";
  return `${count} ${noun}`;
}

export function AdminScreen() {
  const [adminTab, setAdminTab] = useState<"overview" | "accounts" | "slots" | "calendar">("overview");
  const [returnTab, setReturnTab] = useState<"overview" | "accounts" | "slots" | "calendar">("accounts");
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
  const openStudent = useCallback((studentId: number, fromTab: "overview" | "accounts" | "slots" | "calendar" = "accounts") => {
    setReturnTab(fromTab);
    setOpenStudentId(studentId);
    setAdminTab("accounts");
  }, []);

  const closeStudentProfile = useCallback(() => {
    setOpenStudentId(null);
    setAdminTab(returnTab);
    setReloadKey((key) => key + 1);
  }, [returnTab]);

  const returnLabel = {
    overview: "К обзору",
    accounts: "К аккаунтам",
    slots: "К слотам записи",
    calendar: "К календарю",
  }[returnTab];

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
      <section className={`admin-panel ${adminTab === "calendar" ? "admin-panel--calendar" : ""}`} aria-label="Админ-панель">
        <nav className="admin-tabs" aria-label="Разделы админ-панели">
          <button
            type="button"
            className={adminTab === "overview" ? "is-active" : ""}
            aria-current={adminTab === "overview" ? "page" : undefined}
            onClick={() => { setAdminTab("overview"); setOpenStudentId(null); }}
          >
            <LayoutDashboard size={15} /> Обзор
          </button>
          <button
            type="button"
            className={adminTab === "accounts" ? "is-active" : ""}
            aria-current={adminTab === "accounts" ? "page" : undefined}
            onClick={() => { setAdminTab("accounts"); setOpenStudentId(null); }}
          >
            <User size={15} /> Аккаунты
          </button>
          <button
            type="button"
            className={adminTab === "slots" ? "is-active" : ""}
            aria-current={adminTab === "slots" ? "page" : undefined}
            onClick={() => setAdminTab("slots")}
          >
            <CalendarClock size={15} /> Слоты записи
          </button>
          <button type="button" className={adminTab === "calendar" ? "is-active" : ""}
            aria-current={adminTab === "calendar" ? "page" : undefined} onClick={() => setAdminTab("calendar")}>
            <CalendarDays size={15} /> Календарь
          </button>
        </nav>

        {adminTab === "overview" ? (
          <AsyncBoundary>
            <AdminOverviewDashboard onOpenStudent={(studentId) => openStudent(studentId, "overview")} />
          </AsyncBoundary>
        ) : adminTab === "calendar" ? (
          <AsyncBoundary><AdminCalendarView onOpenStudent={(studentId) => openStudent(studentId, "calendar")} /></AsyncBoundary>
        ) : adminTab === "slots" ? (
          <AsyncBoundary><AdminSlotsView /></AsyncBoundary>
        ) : openStudentId !== null ? (
          <>
            <div className="admin-section-heading admin-section-heading--profile">
              <button className="admin-back" type="button" onClick={closeStudentProfile}>
                <ArrowLeft size={16} aria-hidden="true" /> {returnLabel}
              </button>
            </div>
            <AsyncBoundary key={openStudentId}><AdminStudentProfile
              studentId={openStudentId}
              onBack={closeStudentProfile}
              onDeleted={closeStudentProfile}
            /></AsyncBoundary>
          </>
        ) : (
          <section className="admin-accounts-panel" aria-label="Список аккаунтов">
            <div className="admin-accounts-panel__summary" aria-live="polite">
              <strong>{isLoading ? "Загрузка аккаунтов…" : formatAccountCount(accounts.length)}</strong>
              {!isLoading && !error && <span>Активных подписок: {accounts.filter((account) => account.has_active_subscription).length}</span>}
            </div>
            <AdminAccountFilters search={search} filters={filters} month={quotaMonth}
              onSearch={setSearch} onChange={setFilters} />

            {error && <div className="form-error" role="alert">{error}</div>}

            <div className="admin-account-list" aria-live="polite">
              {isLoading ? (
                <p className="admin-note" role="status">Загружаем аккаунты…</p>
              ) : error ? null : accounts.length === 0 ? (
                <p className="admin-account-list__empty">Ничего не найдено по этим условиям.</p>
              ) : (
                accounts.map((account) => (
                  <button className="admin-account-card" key={account.id} type="button" onClick={() => openStudent(account.id, "accounts")}>
                    <span className="admin-account-card__identity">
                      <strong>
                        {account.username}
                        {account.is_admin && <span className="admin-badge">admin</span>}
                      </strong>
                      <small>{account.email}</small>
                    </span>
                    <span className="admin-account-card__metrics">
                      <span className="admin-account-metric">
                        <small>Подписка</small>
                        <strong className={account.has_active_subscription ? "is-active" : "is-muted"}>
                          {account.has_active_subscription
                            ? `${formatSubscriptionPlan(account.subscription_plan)} · ${formatAdminSubscriptionExpiry(account.subscription_until)}`
                            : "Не активна"}
                        </strong>
                      </span>
                      <span className="admin-account-metric">
                        <small>Уроки · с {formatAdminPeriodStart(completedSince)}</small>
                        <strong>{account.completed_lessons_7d}</strong>
                      </span>
                      <span className="admin-account-metric">
                        <small>Занятия · {getMonthTitle(quotaMonth)}</small>
                        <strong className={account.quota?.remaining === 0 ? "is-empty" : ""}>
                          {account.quota?.remaining ?? "—"} осталось
                        </strong>
                      </span>
                    </span>
                    <ChevronRight size={18} className="admin-account-card__chevron" aria-hidden="true" />
                  </button>
                ))
              )}
            </div>
          </section>
        )}
      </section>
  );
}
