import { Check, Copy, Laptop, LogOut, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../../shared/api/contracts";

export interface AccountSessionData {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AccountSettingsData {
  sessions: AccountSessionData[];
}

export function AccountSettings({ user, data = null, onLogout }: {
  user: Pick<UserProfile, "username" | "email">;
  data?: AccountSettingsData | null;
  onLogout: () => void;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="account-section-stack">
      <div className="account-settings-grid">
        <section className="account-surface account-detail-card">
          <header><h3>Личные данные</h3><span className="account-settings-readonly">Только просмотр</span></header>
          <dl className="account-settings-details">
            <div>
              <dt><UserRound size={15} aria-hidden="true" /> Имя</dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt><Mail size={15} aria-hidden="true" /> Email</dt>
              <dd className="account-settings-email">
                <span>{user.email}</span>
                <button type="button" onClick={() => void copyEmail()} aria-label="Скопировать email" title="Скопировать email">
                  {copyState === "copied" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                  {copyState === "copied" ? "Скопировано" : "Копировать"}
                </button>
              </dd>
            </div>
          </dl>
          <p className="account-settings-note" aria-live="polite">
            {copyState === "error" ? "Не удалось скопировать email в этом браузере." : "Изменение данных профиля пока недоступно."}
          </p>
        </section>

        <section className="account-surface account-detail-card">
          <header><div><h3>Активные сеансы</h3><p>Устройства, где выполнен вход</p></div><ShieldCheck size={19} aria-hidden="true" /></header>
          {data?.sessions.length ? (
            <div className="account-session-list">
              {data.sessions.map((session) => (
                <article className="account-session" key={session.id}>
                  <span className="account-session__icon"><Laptop size={18} aria-hidden="true" /></span>
                  <div className="account-session__details">
                    <strong>{session.device}</strong>
                    <span><MapPin size={13} aria-hidden="true" /> {session.location} · {session.lastActive}</span>
                  </div>
                  {session.isCurrent && <span className="account-session__current"><ShieldCheck size={13} aria-hidden="true" /> Этот сеанс</span>}
                </article>
              ))}
            </div>
          ) : (
            <div className="account-empty-state account-empty-state--compact">
              <span className="account-empty-state__icon"><Laptop size={24} aria-hidden="true" /></span>
              <strong>{data ? "Активных сеансов не найдено" : "Управление устройствами появится позже"}</strong>
              <p>{data
                ? "Здесь будут перечислены устройства, на которых открыт аккаунт."
                : "Сейчас вы можете завершить текущий сеанс кнопкой ниже."}</p>
            </div>
          )}
        </section>
      </div>

      <div className="account-settings-logout">
        <div>
          <strong>Завершить текущий сеанс</strong>
          <span>Выход из аккаунта на этом устройстве.</span>
        </div>
        <button type="button" onClick={onLogout}><LogOut size={15} aria-hidden="true" /> Выйти</button>
      </div>
    </div>
  );
}
