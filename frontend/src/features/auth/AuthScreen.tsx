import { useState, type FormEvent } from "react";
import { loginUser, registerUser } from "./api";
import { ThemeToggle } from "../../shared/ui/theme-toggle/ThemeToggle";
import type { UserProfile } from "../../shared/api/contracts";
import type { ThemeMode } from "../../shared/ui/theme-toggle/types";
type AuthMode = "login" | "register";

export function AuthScreen({
  onAuth,
  theme,
  onToggleTheme,
  onBack,
}: {
  onAuth: (user: UserProfile) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onBack?: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <section className="auth-panel">
        <div className="auth-header">
          <div className="auth-brand">
            <span>pymentor</span>
            <strong>Learning workspace</strong>
          </div>
          <div className="auth-actions">
            {onBack && (
              <button className="secondary-action secondary-action--compact" type="button" onClick={onBack}>
                Вернуться к урокам
              </button>
            )}
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>
        </div>

        <div className="auth-tabs" aria-label="Авторизация">
          <button className={mode === "login" ? "is-active" : ""} type="button" onClick={() => setMode("login")}>
            Вход
          </button>
          <button className={mode === "register" ? "is-active" : ""} type="button" onClick={() => setMode("register")}>
            Регистрация
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
          </label>
          <label>
            Пароль
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              maxLength={128}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Проверка..." : mode === "login" ? "Войти в кабинет" : "Создать кабинет"}
          </button>
        </form>
      </section>
    </main>
  );
}
