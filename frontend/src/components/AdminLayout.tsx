import { For, Show, createSignal } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { usePermissions, ROLES } from "../lib/permissions";
import { Menu } from "lucide-solid";
import { Motion, Presence } from "solid-motionone";

interface Props {
  children?: any;
}

interface SubTab {
  key: string;
  label: string;
  path: string;
}

interface Tab {
  key: string;
  label: string;
  path?: string;
  subTabs?: SubTab[];
}

const adminTabs: Tab[] = [
  {
    key: "posts-verification",
    label: "Верификация объявлений",
    path: "/admin/posts/verification",
  },
  {
    key: "users",
    label: "Пользователи",
    path: "/admin/users",
  },
  {
    key: "subjects",
    label: "Предметы",
    path: "/admin/subjects",
  },
  {
    key: "rooms",
    label: "Кабинеты",
    path: "/admin/rooms",
  },
  {
    key: "student-groups",
    label: "Учебные группы",
    path: "/admin/student_groups",
  },
  {
    key: "positions",
    label: "Должности",
    subTabs: [
      {
        key: "positions-institution-administrators",
        label: "Администрация",
        path: "/admin/positions/institution_administrators",
      },
      {
        key: "positions-staff",
        label: "Сотрудники",
        path: "/admin/positions/staff",
      },
    ],
  },
  {
    key: "invite-tokens",
    label: "Инвайт-токены",
    path: "/admin/invite_tokens",
  },
];

const superadminTabs: Tab[] = [
  {
    key: "users",
    label: "Пользователи",
    path: "/admin/users",
  },
  {
    key: "invite-tokens",
    label: "Инвайт-токены",
    path: "/admin/invite_tokens",
  },
  {
    key: "documents",
    label: "Документы",
    path: "/admin/documents",
  },
];

const AdminLayout = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = createSignal<string | null>(null);
  const { hasRole, hasAnyRole } = usePermissions();

  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (tab: Tab) => {
    if (tab.path && isActive(tab.path)) return true;
    if (tab.subTabs) {
      return tab.subTabs.some((sub) => isActive(sub.path));
    }
    return false;
  };

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu(openSubmenu() === key ? null : key);
  };

  const SidebarContent = () => (
    <>
      <div class="p-5 border-b border-border">
        <h2 class="text-lg font-semibold text-text">
          Панель{" "}
          {hasRole(ROLES.ADMIN) ? "администратора" : "суперадминистратора"}
        </h2>
        <p class="text-xs text-text-muted mt-1">Управление системой</p>
      </div>
      <nav class="flex-1 p-3">
        <div class="space-y-0.5">
          <For each={hasRole(ROLES.ADMIN) ? adminTabs : superadminTabs}>
            {(tab) => (
              <div>
                {tab.path ? (
                  <button
                    onClick={() => {
                      navigate(tab.path!);
                      setMobileMenuOpen(false);
                    }}
                    class={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-text ${isActive(tab.path) ? "bg-surface-2" : "hover:bg-surface-2"}`}
                  >
                    {tab.label}
                  </button>
                ) : (
                  <button
                    onClick={() => toggleSubmenu(tab.key)}
                    class={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex justify-between items-center cursor-pointer text-text ${isParentActive(tab) ? "bg-surface-2" : "hover:bg-surface-2"}`}
                  >
                    <span>{tab.label}</span>
                    <span>{openSubmenu() === tab.key ? "▾" : "▸"}</span>
                  </button>
                )}

                <Show when={tab.subTabs && openSubmenu() === tab.key}>
                  <div class="ml-3 pl-3 border-l border-border mt-1 space-y-0.5">
                    <For each={tab.subTabs}>
                      {(sub) => (
                        <button
                          onClick={() => {
                            navigate(sub.path);
                            setMobileMenuOpen(false);
                          }}
                          class={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer text-text ${isActive(sub.path) ? "bg-surface-2 font-medium" : "hover:bg-surface-2"}`}
                        >
                          {sub.label}
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </nav>
    </>
  );

  return (
    <>
      {hasAnyRole(ROLES.ADMIN, ROLES.SUPERADMIN) && (
        <div class="flex min-h-screen bg-bg">
          {/*Desktop menu*/}
          <aside class="hidden md:flex w-64 bg-surface border-r border-border rounded-lg flex flex-col">
            <SidebarContent />
          </aside>

          {/* Mobile menu hamburger */}
          <div class="md:hidden fixed top-20 left-4 z-40">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              class="p-2 bg-surface rounded-lg shadow-md"
            >
              <Menu />
            </button>
          </div>

          {/* Mobile menu (overlay) */}
          <Presence>
            <Show when={mobileMenuOpen()}>
              <Motion.div
                class="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
              />
            </Show>
          </Presence>
          {/* content */}
          <Presence>
            <Show when={mobileMenuOpen()}>
              <Motion.aside
                class="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-surface z-50 flex flex-col shadow-xl"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <SidebarContent />
              </Motion.aside>
            </Show>
          </Presence>

          <main class="flex-1 overflow-auto pt-16 md:pt-6 md:pl-6">
            <div class="p-0 md:p-6 md:bg-surface md:rounded-lg md:shadow-sm">
              {props.children}
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default AdminLayout;
