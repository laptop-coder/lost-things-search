import { createSignal, createEffect } from "solid-js";
import { useAuth } from "../lib/auth";
import { useNavigate } from "@solidjs/router";

const Login = () => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const auth = useAuth();
  const navigate = useNavigate();

  let emailInputRef: HTMLInputElement | undefined;
  const focusEmailInput = () => {
    if (emailInputRef) {
      emailInputRef.focus();
    }
  };

  createEffect(() => {
    focusEmailInput();
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.login(email(), password());
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось войти в учётную запись",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[80vh] flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-text">Вход в учётную запись</h1>
          <p class="text-text-muted mt-2">Добро пожаловать!</p>
        </div>

        <form
          onSubmit={handleSubmit}
          class="bg-surface rounded-2xl shadow-lg p-6 space-y-5"
        >
          <div>
            <label class="block text-sm font-medium text-text mb-1">
              Email
            </label>
            <input
              ref={emailInputRef}
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              placeholder="email@example.ru"
              class="w-full px-4 py-2 border border-border rounded-xl  transition text-text"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              placeholder="••••••••"
              class="w-full px-4 py-2 border border-border rounded-xl  transition text-text"
              required
            />
          </div>

          {error() && (
            <div class="bg-urgent-bg text-urgent p-3 rounded-xl text-sm border border-urgent">
              {error()}
            </div>
          )}

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading()}
              class="flex-1 px-4 py-2 bg-accent text-bg rounded-xl hover:bg-accent-hover transition font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading() ? "Вход..." : "Войти"}
            </button>
          </div>

          <div class="flex flex-col">
            <a
              href="/forgot-password"
              class="text-text hover:text-text-muted hover:underline"
            >
              Забыли пароль?
            </a>

            <p class="text-sm text-text mt-4 flex flex-col">
              Ученик или родитель?
              <a
                href="/register"
                class="text-text hover:text-text-muted hover:underline"
              >
                Запросить пригласительную ссылку
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
