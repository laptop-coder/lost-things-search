import { createSignal, Show, onMount } from "solid-js";
import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { api } from "../lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token =
    typeof searchParams.token === "string" ? searchParams.token : undefined;

  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [done, setDone] = createSignal(false);

  onMount(() => {
    if (!token) {
      navigate("/login");
    }
  });

  const handleSubmit = async (e: Event) => {
    if (!token) return;
    e.preventDefault();

    // TODO: think about checks like here in the whole code
    if (password().length < 8) {
      setError("Пароль должен быть не менее 8 символов");
      return;
    }
    if (password() !== confirmPassword()) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("password", password());
      await api.post("/auth/reset-password", formData);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сброса пароля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[80vh] flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Сброс пароля</h1>
          <p class="text-gray-500 mt-2">Придумайте новый пароль</p>
        </div>

        <Show when={!token}>
          <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center">
            Недействительная ссылка
          </div>
        </Show>

        <Show
          when={token && !done()}
          fallback={
            <div class="flex flex-col justify-center items-center">
              <div class="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center">
                <p class="text-lg font-semibold">Пароль успешно изменён!</p>
              </div>
              <A href="/login" class="text-blue-600 hover:underline mt-4">
                Войти
              </A>
            </div>
          }
        >
          <form
            onSubmit={handleSubmit}
            class="bg-white rounded-2xl shadow-lg p-6 space-y-5"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Новый пароль *
              </label>
              <input
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                placeholder="••••••••"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Подтверждение пароля *
              </label>
              <input
                type="password"
                value={confirmPassword()}
                onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                placeholder="••••••••"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <Show when={error()}>
              <div class="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200">
                {error()}
              </div>
            </Show>

            <button
              type="submit"
              disabled={
                loading() || !password().trim() || !confirmPassword().trim()
              }
              class="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              {loading() ? "Сохранение..." : "Сохранить пароль"}
            </button>
          </form>
        </Show>
      </div>
    </div>
  );
};

export default ResetPassword;
