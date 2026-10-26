import { Laptop, LogOut, Mail, MapPin, Pencil, ShieldCheck, UserRound } from "lucide-react";
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
  return (
    <div className="account-section-stack">
      <header className="account-section-heading">
        <div><h2>Настройки аккаунта</h2><p>Личные данные и устройства с доступом к аккаунту.</p></div>
        {!data && <span className="account-coming-soon">Скоро</span>}
      </header>

      <div className="account-settings-grid">
        <section className="account-surface account-detail-card">
          <header>
            <h3>Личные данные</h3>
            <button className="account-settings-edit" type="button" disabled title="Редактирование появится позже">
              <Pencil size={14} aria-hidden="true" /> Изменить
            </button>
          </header>
          <dl className="account-settings-details">
            <div>
              <dt><UserRound size={15} aria-hidden="true" /> Имя</dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt><Mail size={15} aria-hidden="true" /> Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
          <p className="account-settings-note">Изменение данных станет доступно позже.</p>
        </section>

        <section className="account-surface account-detail-card">
          <header><h3>Активные сеансы</h3><span>Устройства, где открыт аккаунт</span></header>
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
              <strong>{data ? "Активных сеансов не найдено" : "Список устройств пока недоступен"}</strong>
              <p>{data
                ? "Здесь будут перечислены устройства, на которых открыт аккаунт."
                : "Устройства и местоположение появятся после подключения управления сеансами."}</p>
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
