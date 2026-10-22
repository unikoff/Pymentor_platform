import "./auth.css";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, LogIn, UserRoundPlus } from "lucide-react";
import { loginUser, registerUser } from "./api";
import { ThemeToggle } from "../../shared/ui/theme-toggle/ThemeToggle";
import type { UserProfile } from "../../shared/api/contracts";
type AuthMode = "login" | "register";

export function AuthScreen({
  onAuth,
  onBack,
}: {
  onAuth: (user: UserProfile) => void;
  onBack?: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const emailValue = email.trim();
      const loginPayload = { email: emailValue, password };

      if (mode === "register") {
        const usernameValue = username.trim();
        if (usernameValue.length < 3) {
          throw new Error("Имя должно быть не короче 3 символов");
        }

        await registerUser({ username: usernameValue, ...loginPayload });
      }

      const data = await loginUser(loginPayload);
      onAuth(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить вход");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="auth-brand__wordmark">pymentor</span>
          </div>
          <div className="auth-actions">
            {onBack && (
              <button className="secondary-action secondary-action--compact" type="button" onClick={onBack}>
                <ArrowLeft size={15} aria-hidden="true" />
                <span>К урокам</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div className="auth-intro" aria-live="polite">
          <h1 id="auth-title">{mode === "login" ? "С возвращением" : "Создайте аккаунт"}</h1>
          <p>{mode === "login" ? "Войдите, чтобы продолжить обучение." : "Создайте аккаунт, чтобы сохранить прогресс."}</p>
        </div>

        <div className="auth-tabs" role="group" aria-label="Способ доступа">
          <button className={mode === "login" ? "is-active" : ""} type="button" aria-pressed={mode === "login"} onClick={() => { setMode("login"); setIsPasswordVisible(false); }}>
            <LogIn size={16} aria-hidden="true" />
            Вход
          </button>
          <button className={mode === "register" ? "is-active" : ""} type="button" aria-pressed={mode === "register"} onClick={() => { setMode("register"); setIsPasswordVisible(false); }}>
            <UserRoundPlus size={16} aria-hidden="true" />
            Регистрация
          </button>
        </div>

        <form key={mode} className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Имя
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3}
                maxLength={40}
                autoComplete="name"
                required
              />
            </label>
          )}
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoCapitalize="none" autoComplete="email" spellCheck={false} required />
          </label>
          <div className="auth-password-group">
            <label htmlFor="auth-password">Пароль</label>
            <span className="auth-password-field">
              <input
                id="auth-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={isPasswordVisible ? "text" : "password"}
                minLength={8}
                maxLength={128}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
              <button
                className="auth-password-toggle"
                type="button"
                aria-label={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
                aria-pressed={isPasswordVisible}
                title={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </span>
          </div>
          <p className="auth-security-note">
            <LockKeyhole size={14} aria-hidden="true" />
            <span>Пароль защищён bcrypt-хешированием и не хранится в открытом виде.</span>
          </p>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Проверка..." : <>{mode === "login" ? "Войти" : "Создать аккаунт"}<ArrowRight size={16} aria-hidden="true" /></>}
          </button>
        </form>
      </section>
    </main>
  );
}
