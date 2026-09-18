import {
  type Component,
  type JSX,
  Show,
  createEffect,
  createSignal,
  onMount,
  onCleanup,
} from "solid-js";
import { useLocation, A, Navigate } from "@solidjs/router";
import { useAuth } from "../lib/auth";
import { usePermissions, PERMISSIONS, ROLES } from "../lib/permissions";
import { unreadMessagesCount, refreshUnreadMessagesCount } from "../lib/store";
import { MessageSquareText, Settings2, Plus } from "lucide-solid";

interface Props {
  children?: JSX.Element;
}

export const PublicRoute: Component<Props> = (props) => {
  const auth = useAuth();
  const location = useLocation();
  const { hasPermission, hasAnyRole } = usePermissions();

  createEffect(async () => {
    if (auth.user()) {
      await refreshUnreadMessagesCount();
    }
  });

  const [isMobile, setIsMobile] = createSignal(window.innerWidth < 768);

  onMount(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    onCleanup(() => mq.removeEventListener("change", handler));
  });

  // /conversations/<any_string>
  const isMobileConversationViewPage = () =>
    /^\/conversations\/[^/]+$/.test(location.pathname) && isMobile();

  return (
    <div class="min-h-screen bg-bg flex flex-col">
      <header class="bg-surface border-b border-border shadow-sm sticky top-0 z-30">
        <div class="container mx-auto px-4 h-16 flex justify-between items-center">
          <A href="/" class="flex items-center gap-3">
            <img
              class="w-10 h-10 rounded-full object-cover"
              src={`/storage/assets/logo.svg`}
              alt="Логотип"
            />
            <span class="text-xl font-bold text-text">
              <span class="hidden md:block">LostThingsSearch</span>
            </span>
          </A>
          <Show when={!auth.user() && location.pathname === "/"}>
            <A
              href="/documents/privacy.pdf"
              target="_blank"
              class="text-sm text-text hover:text-text-muted transition text-nowrap hidden md:block"
            >
              Политика конфиденциальности
            </A>
            <A
              href="/about"
              class="text-sm text-text hover:text-text-muted transition text-nowrap"
            >
              О проекте
            </A>
          </Show>

          <div class="flex items-center gap-3">
            {auth.user() ? (
              <>
                {hasAnyRole(ROLES.ADMIN, ROLES.SUPERADMIN) && (
                  <A
                    href="/admin"
                    class="bg-surface-2 text-text rounded-lg hover:brightness-90 transition flex items-center justify-center w-10 h-10"
                  >
                    <Settings2 />
                  </A>
                )}

                {hasPermission(PERMISSIONS.POST_CREATE) && (
                  <A
                    href="/posts/new"
                    class="bg-surface-2 text-text rounded-lg hover:brightness-90 transition flex items-center justify-center w-10 h-10"
                  >
                    <Plus />
                  </A>
                )}

                <Show when={hasPermission(PERMISSIONS.CONVERSATION_READ_OWN)}>
                  <A
                    href="/conversations"
                    class="bg-surface-2 text-text rounded-lg hover:brightness-90 transition flex items-center justify-center w-10 h-10 relative"
                  >
                    <MessageSquareText />
                    <Show when={unreadMessagesCount() > 0}>
                      <div class="bg-accent text-bg text-xs font-medium px-2 py-1 rounded-full absolute -top-1 -right-1">
                        {unreadMessagesCount()}
                      </div>
                    </Show>
                  </A>
                </Show>

                <A
                  href="/profile"
                  class="w-10 h-10 flex bg-surface rounded-full hover:brightness-90 transition"
                >
                  <img
                    class="w-10 h-10 rounded-full object-cover border-2 border-border hover:brightness-95 transition"
                    src={
                      auth.user()?.hasAvatar
                        ? `/storage/storage/avatars/${auth.user()?.id}.jpeg`
                        : "/storage/assets/default_avatar.jpeg"
                    }
                    alt="Фото профиля"
                  />
                </A>
              </>
            ) : (
              <Show when={location.pathname !== "/login"}>
                <A
                  href="/login"
                  class="px-4 py-1.5 bg-accent text-white rounded-lg hover:bg-accent-2 transition"
                >
                  Войти
                </A>
              </Show>
            )}
          </div>
        </div>
      </header>

      {/*Mobile chat page*/}
      <Show when={isMobileConversationViewPage()}>
        <div class="fixed inset-0 top-0 pt-16 z-10">{props?.children}</div>
      </Show>

      <Show when={!isMobileConversationViewPage()}>
        <main class="container mx-auto px-4 py-8" flex-1>
          {props?.children}
        </main>

        <footer class="bg-surface border-t border-border mt-auto">
          <div class="container mx-auto px-4 py-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
              <div class="text-sm text-text text-nowrap">
                © {new Date().getFullYear()} LostThingsSearch.
              </div>

              <div class="flex gap-4 md:gap-6 flex-col md:flex-row items-center justify-center">
                <A
                  href="/documents/privacy.pdf"
                  target="_blank"
                  class="text-sm text-text hover:text-text-muted transition text-nowrap"
                >
                  Политика конфиденциальности
                </A>
                <A
                  href="/about"
                  class="text-sm text-text hover:text-text-muted transition text-nowrap"
                >
                  О проекте
                </A>
              </div>
            </div>
          </div>
        </footer>
      </Show>
    </div>
  );
};

export const ProtectedRoute: Component<Props> = (props) => {
  const auth = useAuth();
  return (
    <Show when={!auth.isLoading()}>
      <Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
        <PublicRoute>{props?.children}</PublicRoute>
      </Show>
    </Show>
  );
};
