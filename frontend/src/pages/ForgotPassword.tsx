import { createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { api } from "../lib/api";
import { Mail } from "lucide-solid";

const ForgotPassword = () => {
  const [email, setEmail] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [sent, setSent] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!email().trim()) return;

    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("email", email());
      await api.post("/auth/forgot-password", formData);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[80vh] flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Забыли пароль?</h1>
          <p class="text-gray-500 mt-2">
            Укажите email, и мы отправим инструкцию по сбросу пароля
          </p>
        </div>

        <Show
          when={!sent()}
          fallback={
            <div class="flex flex-col justify-center items-center">
              <div class="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center">
                <Mail class="w-10 h-10 mx-auto mb-3 text-green-600" />
                <p>Инструкция по сбросу пароля отправлена на указанный email</p>
              </div>
              <A href="/login" class="block mt-4 text-blue-600 hover:underline">
                Вернуться ко входу
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
                Email *
              </label>
              <input
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                placeholder="email@example.ru"
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
              disabled={loading() || !email().trim()}
              class="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              {loading() ? "Отправка..." : "Отправить"}
            </button>

            <p class="text-center text-sm text-gray-500">
              <A href="/login" class="text-blue-600 hover:underline">
                Вернуться ко входу
              </A>
            </p>
          </form>
        </Show>
      </div>
    </div>
  );
};

export default ForgotPassword;
