import { useEffect, useRef, useState, type FormEvent } from "react";
import type { UserProfile } from "../../shared/api/contracts";
import { confirmEmailChange, confirmEmailVerification, confirmPasswordReset, getCurrentUser } from "./api";
import type { EmailLink } from "./email-link";
import "./auth.css";

export function EmailActionScreen({ link, user, onUserChange, onClose }: {
  link: EmailLink | null;
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (link?.action !== "verify_email" || verificationStarted.current) return;
    verificationStarted.current = true;
    setBusy(true);
    void confirmEmailVerification(link.token).then(async () => {
      if (user) {
        try { onUserChange((await getCurrentUser()).user); } catch { /* confirmation already succeeded */ }
      }
      setMessage("Почта подтверждена.");
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Не удалось подтвердить почту");
    }).finally(() => setBusy(false));
  }, [link, user, onUserChange]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!link) return;
    setError("");
    if (link.action !== "verify_email" && password !== repeat) {
      setError("Пароли не совпадают");
      return;
    }
    if (link.action !== "verify_email" && new TextEncoder().encode(password).length > 72) {
      setError("Пароль слишком длинный. Сократите его и попробуйте снова.");
      return;
    }
    setBusy(true);
    try {
      await confirmPasswordReset(link.token, password);
      try {
        onUserChange((await getCurrentUser()).user);
        setMessage("Пароль изменён. Текущий сеанс сохранён.");
      } catch {
        onUserChange(null);
        setMessage("Пароль изменён. Войдите с новым паролем.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить действие");
    } finally { setBusy(false); }
  }

  async function submitEmailChange() {
    if (!link || link.action !== "change_email") return;
    setBusy(true); setError("");
    try {
      const result = await confirmEmailChange(link.token);
      if (user) {
        try { onUserChange((await getCurrentUser()).user); } catch { /* the change already succeeded */ }
      }
      setMessage(result.message);
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось сменить почту"); }
    finally { setBusy(false); }
  }

  return <main className="auth-layout"><section className="auth-panel">
    <div className="auth-intro"><h1>{link?.action === "verify_email" ? "Подтверждение почты" : link?.action === "change_email" ? "Смена почты" : "Новый пароль"}</h1></div>
    {!link ? <p role="alert">Ссылка недействительна. Запросите новое письмо.</p> : message ? <p role="status">{message}</p> : link.action === "verify_email" ?
      <p role={error ? "alert" : "status"}>{error || "Подтверждаем почту…"}</p> : link.action === "change_email" ?
      <div className="auth-form"><p>Подтвердите этот адрес. Почта аккаунта изменится после подтверждения обоих адресов.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-action" type="button" disabled={busy} onClick={() => void submitEmailChange()}>{busy ? "Проверяем…" : "Подтвердить смену почты"}</button>
      </div> :
      <form className="auth-form" onSubmit={(event) => void submit(event)}>
        <p className="auth-session-note">Если вы вошли в этот аккаунт в данном браузере, текущий сеанс сохранится. На остальных устройствах потребуется войти заново.</p>
        <>
          <label>Новый пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" required /></label>
          <label>Повторите пароль<input type="password" value={repeat} onChange={(event) => setRepeat(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" required /></label>
        </>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-action" disabled={busy} type="submit">{busy ? "Проверяем…" : "Сохранить пароль"}</button>
      </form>}
    {(message || !link || (link.action === "verify_email" && error)) && <button type="button" className="secondary-action" onClick={onClose}>Продолжить</button>}
  </section></main>;
}
