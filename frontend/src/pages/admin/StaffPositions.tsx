import { createSignal, createEffect, onMount, For, Show } from "solid-js";
import { api } from "../../lib/api";
import { PERMISSIONS } from "../../lib/permissions";
import { usePermissions } from "../../lib/permissions";
import type { StaffPosition } from "../../lib/types";
import Pagination from "../../components/Pagination";
import { Briefcase, Plus } from "lucide-solid";
import { Motion } from "solid-motionone";
import Skeleton from "../../components/Skeleton";

const StaffPositions = () => {
  const [staffPositions, setStaffPositions] = createSignal<StaffPosition[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal("");
  const [newStaffPositionName, setNewStaffPositionName] = createSignal("");
  const [creating, setCreating] = createSignal(false);
  const [deletingId, setDeletingId] = createSignal<number | null>(null);
  const [page, setPage] = createSignal(0);
  const [hasMore, setHasMore] = createSignal(true);

  const { hasPermission } = usePermissions();

  let inputRef: HTMLInputElement | undefined;
  const focusInput = () => {
    if (inputRef && window.innerWidth >= 768) {
      inputRef.focus();
    }
  };

  createEffect(() => {
    focusInput();
  });

  const limit = 30;

  createEffect(() => {
    page();
    loadStaffPositions();
  });

  const loadStaffPositions = async () => {
    try {
      const data = await api.get<{ staffPositions: StaffPosition[] }>(
        `/staff/positions?limit=${limit + 1}&offset=${page() * limit}`,
      );
      setHasMore(data.staffPositions.length > limit);
      setStaffPositions(data.staffPositions.slice(0, limit));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка загрузки списка должностей",
      );
    } finally {
      setLoading(false);
    }
  };

  const createStaffPosition = async (e: Event) => {
    e.preventDefault();
    if (!newStaffPositionName().trim()) return;

    setCreating(true);
    try {
      const formData = new URLSearchParams();
      formData.append("name", newStaffPositionName().trim());

      await api.post("/staff/positions", formData);
      setNewStaffPositionName("");
      await loadStaffPositions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка создания должности",
      );
    } finally {
      setCreating(false);
      focusInput();
    }
  };

  const deleteStaffPosition = async (id: number) => {
    if (!confirm("Удалить должность? Это действие нельзя отменить.")) return;

    setDeletingId(id);
    try {
      await api.delete(`/staff/positions/${id}`);
      await loadStaffPositions();
      if (staffPositions().length === 0 && page() > 0) {
        setPage((prev) => prev - 1);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка удаления должности",
      );
    } finally {
      setDeletingId(null);
      focusInput();
    }
  };

  onMount(() => {
    loadStaffPositions();
  });

  return (
    <div class="space-y-6 p-4">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-text">Должности сотрудников ОУ</h1>
        <p class="text-gray-500 mt-1">Управление должностями сотрудников</p>
      </div>

      <Show when={error()}>
        <div class="bg-urgent-bg border border-urgent text-urgent p-3 rounded-xl">
          {error()}
        </div>
      </Show>

      {/* Form for positions creating */}
      <Show when={hasPermission(PERMISSIONS.POSITION_STAFF_CREATE)}>
        <div class="bg-surface rounded-2xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-text mb-4">
            Добавить должность
          </h2>
          <form onSubmit={createStaffPosition} class="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newStaffPositionName()}
              onInput={(e) => setNewStaffPositionName(e.currentTarget.value)}
              placeholder="Название должности"
              class="w-full px-4 py-2 border border-border rounded-xl  transition disabled:opacity-50 text-text"
              disabled={creating()}
            />
            <button
              type="submit"
              disabled={creating() || !newStaffPositionName().trim()}
              class="max-md:aspect-square flex items-center justify-center px-2 md:px-4 bg-accent text-bg rounded-xl hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span class="hidden md:flex">Создать</span>
              <Plus class="flex md:hidden" />
            </button>
          </form>
        </div>
      </Show>

      {/* List of positions */}
      <Show when={loading()}>
        <div class="space-y-4 py-8">
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-32 w-full" />
          <Skeleton class="h-10 w-24" />
        </div>
      </Show>

      <Show when={!loading() && staffPositions().length === 0}>
        <div class="flex flex-col items-center justify-center gap-1 py-16">
          <Briefcase class="w-15 h-15 mb-3 text-text" />
          <p class="text-text">Нет должностей</p>
          <p class="text-text-muted text-sm mt-1">Создайте первую</p>
        </div>
      </Show>

      <Show when={!loading() && staffPositions().length > 0}>
        <Motion.div
          class="bg-surface rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-surface-2 border-b border-border">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-text">
                    ID
                  </th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-text">
                    Название
                  </th>
                  <th class="px-6 py-4 text-right text-sm font-semibold text-text">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <For each={staffPositions()}>
                  {(position) => (
                    <tr class="bg-surface hover:brightness-90 transition">
                      <td class="px-6 py-4 text-sm text-text font-mono">
                        {position.id}
                      </td>
                      <td class="px-6 py-4 font-medium text-text">
                        {position.name}
                      </td>
                      <td class="px-6 py-4 text-right">
                        <Show
                          when={hasPermission(
                            PERMISSIONS.POSITION_STAFF_DELETE,
                          )}
                        >
                          <button
                            onClick={() => deleteStaffPosition(position.id)}
                            disabled={deletingId() === position.id}
                            class="text-urgent hover:text-urgent disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed font-medium"
                          >
                            {deletingId() === position.id
                              ? "Удаление..."
                              : "Удалить"}
                          </button>
                        </Show>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Motion.div>
      </Show>
      <Pagination
        page={page()}
        hasMore={hasMore()}
        onPrev={() => setPage((prev) => prev - 1)}
        onNext={() => setPage((prev) => prev + 1)}
      />
    </div>
  );
};

export default StaffPositions;
