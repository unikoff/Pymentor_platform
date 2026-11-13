import { Check, Copy, Laptop, LockKeyhole, LogOut, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { UserProfile } from "../../shared/api/contracts";
import { requestEmailChange, requestEmailVerification, requestPasswordChange, updateProfile } from "../auth/api";

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

export function AccountSettings({ user, data = null, onLogout, onUserChange }: {
  user: Pick<UserProfile, "username" | "email" | "verified">;
  data?: AccountSettingsData | null;
  onLogout: () => void;
  onUserChange: (user: UserProfile) => void;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [editing, setEditing] = useState<"name" | "email" | null>(null);
  const [name, setName] = useState(user.username);
  const [newEmail, setNewEmail] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditBusy(true); setEditMessage("");
    try {
      const result = await updateProfile(name.trim());
      onUserChange(result.user); setEditing(null); setEditMessage("Имя сохранено.");
    } catch (error) { setEditMessage(error instanceof Error ? error.message : "Не удалось сохранить имя"); }
    finally { setEditBusy(false); }
  }

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditBusy(true); setEditMessage("");
    try {
      await requestEmailChange(newEmail.trim());
      setEditing(null); setNewEmail("");
      setEditMessage("Письма отправлены на оба адреса. Подтвердите каждый из них, чтобы сменить почту.");
    } catch (error) { setEditMessage(error instanceof Error ? error.message : "Не удалось отправить письмо"); }
    finally { setEditBusy(false); }
  }

  async function sendVerification() {
    setVerificationBusy(true);
    setVerificationMessage("");
    try {
      await requestEmailVerification();
      setVerificationMessage("Ссылка отправлена — проверьте почту.");
    } catch (error) {
      setVerificationMessage(error instanceof Error ? error.message : "Не удалось отправить письмо");
    } finally { setVerificationBusy(false); }
  }

  async function sendPasswordChange() {
    setPasswordBusy(true);
    setPasswordMessage("");
    try {
      await requestPasswordChange();
      setPasswordMessage("Проверьте почту: мы отправили ссылку для смены пароля.");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Не удалось отправить письмо");
    } finally { setPasswordBusy(false); }
  }

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
          <header><h3>Личные данные</h3></header>
          <dl className="account-settings-details">
            <div className="account-settings-field">
              <dt><UserRound size={15} aria-hidden="true" /> Имя</dt>
              <dd className="account-settings-edit-row"><span>{user.username}</span><button type="button" onClick={() => { setName(user.username); setEditing("name"); setEditMessage(""); }}>Изменить</button></dd>
              {editing === "name" && <dd><form className="account-settings-edit-form" onSubmit={(event) => void saveName(event)}>
                <label>Новое имя<input value={name} onChange={(event) => setName(event.target.value)} minLength={3} maxLength={40} required /></label>
                <div><button type="submit" disabled={editBusy}>Сохранить</button><button type="button" onClick={() => { setEditing(null); setEditMessage(""); }} disabled={editBusy}>Отмена</button></div>
              </form></dd>}
            </div>
            <div className="account-settings-field">
              <dt><Mail size={15} aria-hidden="true" /> Email</dt>
              <dd className="account-settings-email">
                <span className="account-settings-email__value">{user.email}</span>
                <span className="account-settings-email__actions">
                  <button className="account-settings-email__copy" type="button" onClick={() => void copyEmail()} aria-label={copyState === "copied" ? "Email скопирован" : "Скопировать email"} title={copyState === "copied" ? "Скопировано" : "Скопировать email"}>
                    {copyState === "copied" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                  </button>
                  <button className="account-settings-email__change" type="button" disabled={!user.verified} onClick={() => { setEditing("email"); setEditMessage(""); }}>Сменить почту</button>
                </span>
              </dd>
              {!user.verified && <dd className="account-settings-feedback">Для смены почты сначала подтвердите текущий адрес.</dd>}
              {editing === "email" && <dd><form className="account-settings-edit-form" onSubmit={(event) => void changeEmail(event)}>
                <label>Новая почта<input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} maxLength={100} required /></label>
                <p>Подтвердите оба адреса по письмам. До этого текущая почта останется прежней.</p>
                <div><button type="submit" disabled={editBusy}>{editBusy ? "Отправляем…" : "Отправить письма"}</button><button type="button" onClick={() => { setEditing(null); setEditMessage(""); }} disabled={editBusy}>Отмена</button></div>
              </form></dd>}
              {!user.verified && <dd className="account-email-verification">
                <div className="account-email-verification__row">
                  <span role="status">Почта не подтверждена{verificationMessage && ` · ${verificationMessage}`}</span>
                  <button type="button" onClick={() => void sendVerification()} disabled={verificationBusy}>
                    {verificationBusy ? "Отправляем…" : "Подтвердить"}
                  </button>
                </div>
              </dd>}
              {copyState === "error" && <dd className="account-settings-feedback" role="status">Не удалось скопировать email в этом браузере.</dd>}
            </div>
            <div className="account-settings-field account-settings-password">
              <dt><LockKeyhole size={15} aria-hidden="true" /> Пароль</dt>
              <dd><button type="button" onClick={() => void sendPasswordChange()} disabled={passwordBusy || !user.verified}>
                {passwordBusy ? "Отправляем…" : "Сменить пароль"}
              </button></dd>
              {!user.verified && <dd className="account-settings-feedback">Подтвердите почту, чтобы сменить пароль.</dd>}
              {passwordMessage && <dd className="account-settings-feedback" role="status">{passwordMessage}</dd>}
            </div>
          </dl>
          {editMessage && <p className="account-settings-feedback" role="status">{editMessage}</p>}
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
