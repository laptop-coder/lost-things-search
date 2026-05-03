import {
  createSignal,
  createEffect,
  createMemo,
  onMount,
  onCleanup,
  Index,
  Show,
} from "solid-js";
import { api } from "../lib/api";
import type { Post } from "../lib/types";
import PostCardCompact from "../components/PostCardCompact";
import TabsToggle from "../components/TabsToggle";
import { usePermissions, ROLES } from "../lib/permissions";
import { useAuth } from "../lib/auth";
import Skeleton from "../components/Skeleton";

const PublicPosts = () => {
  const [posts, setPosts] = createSignal<Post[]>([]);
  const [refreshLoading, setRefreshLoading] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const { hasRole } = usePermissions();
  const auth = useAuth();
  const [page, setPage] = createSignal(0);
  const [hasMore, setHasMore] = createSignal(true);
  let observerRef!: HTMLDivElement;
  let observer: IntersectionObserver;

  // for infinite scroll
  const loadPosts = async () => {
    try {
      if (loading() || !hasMore() || page() === 0) return;

      // Save scroll position
      const scrollY = window.scrollY;

      setLoading(true);
      const data = await api.get<{ posts: Post[] }>(
        `/posts/public?author=${ownerTabsActive().query}&thingReturnedToOwner=${statusTabsActive().query}&limit=10&offset=${page() * 10}`,
      );
      setPosts([...posts(), ...data.posts]);
      setPage(page() + 1);
      setHasMore(data.posts.length === 10);

      // Restore scroll position
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка загрузки объявлений",
      );
    } finally {
      setLoading(false);
    }
  };

  // for first loading, for refresh after actions and for refresh when filter changes
  const refreshPosts = async (
    ownerTab?: { query: string },
    statusTab?: { query: string },
  ) => {
    const ownerQuery = ownerTab?.query ?? ownerTabsActive().query;
    const statusQuery = statusTab?.query ?? statusTabsActive().query;
    setPage(0);
    setHasMore(true);
    setRefreshLoading(true);
    try {
      const data = await api.get<{ posts: Post[] }>(
        `/posts/public?author=${ownerQuery}&thingReturnedToOwner=${statusQuery}&limit=10&offset=0`,
      );
      setPosts(data.posts);
      setPage(1);
      setHasMore(data.posts.length === 10);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка загрузки объявлений",
      );
    } finally {
      setRefreshLoading(false);
    }
  };

  onMount(async () => {
    await refreshPosts();
  });

  const setupObserver = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore() &&
          !loading() &&
          !refreshLoading()
        ) {
          loadPosts();
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    if (observerRef) observer.observe(observerRef);
  };

  createEffect(() => {
    hasMore();
    loading();
    setupObserver();
  });

  onCleanup(() => observer.disconnect());

  // Status tabs
  const statusTabs = [
    { label: "Новые", query: "false" },
    { label: "Закрытые", query: "true" },
  ]; // value in the query answers the question "was the thing in the post returned to owner?"

  // Owner tabs
  const ownerTabs = createMemo(() => {
    const tabs = [
      { label: "Все", query: "all" },
      { label: "Мои", query: "me" },
    ];

    if (!auth.user()?.roles) return tabs;

    if (hasRole(ROLES.TEACHER)) {
      tabs.push({ label: "Моих учеников", query: "students" });
    }
    if (hasRole(ROLES.PARENT)) {
      tabs.push({ label: "Моих детей", query: "children" });
      tabs.push({ label: "Одноклассников детей", query: "children_groups" });
    }
    if (hasRole(ROLES.STUDENT)) {
      tabs.push({ label: "Моих родителей", query: "parents" });
      tabs.push({ label: "Моих одноклассников", query: "classmates" });
    }
    return tabs;
  });
  const [ownerTabsActive, setOwnerTabsActive] = createSignal(ownerTabs()[0]);
  const [statusTabsActive, setStatusTabsActive] = createSignal(statusTabs[0]);

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-center">Объявления</h1>

      <div class="flex flex-col gap-3">
        <Show when={auth.user()}>
          <TabsToggle
            tabs={ownerTabs()}
            onChange={(tab) => {
              setOwnerTabsActive(tab);
              refreshPosts(tab, undefined);
            }}
            tabsHTMLElementId="owner_tabs_toggle"
          />
        </Show>
        <TabsToggle
          tabs={statusTabs}
          onChange={(tab) => {
            setStatusTabsActive(tab);
            refreshPosts(undefined, tab);
          }}
          tabsHTMLElementId="status_tabs_toggle"
        />
      </div>

      <Show when={error()}>
        <div class="bg-red-100 text-red-700 p-4 rounded-lg">{error()}</div>
      </Show>

      <Show when={refreshLoading()}>
        <div class="space-y-4 pt-4 md:flex md:flex-row md:gap-4 md:items-start">
          <Skeleton class="w-10 h-10 !rounded-full flex-shrink-0" />
          <div class="flex flex-col space-y-2 flex-1 max-md:pt-2">
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-3 w-1/3" />
            <Skeleton class="h-3 w-3/5" />
          </div>
        </div>
        <div class="space-y-4 pt-4 md:flex md:flex-row md:gap-4 md:items-start">
          <Skeleton class="w-10 h-10 !rounded-full flex-shrink-0" />
          <div class="flex flex-col space-y-2 flex-1 max-md:pt-2">
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-3 w-1/3" />
            <Skeleton class="h-3 w-3/5" />
          </div>
        </div>
      </Show>

      <Show when={!refreshLoading() && !error()}>
        <div class="space-y-4">
          <Index each={posts()}>
            {(post) => (
              <PostCardCompact post={post()} onChange={refreshPosts} />
            )}
          </Index>
          <Show when={loading()}>
            <div class="space-y-4 pt-4 md:flex md:flex-row md:gap-4 md:items-start">
              <Skeleton class="w-10 h-10 !rounded-full flex-shrink-0" />
              <div class="flex flex-col space-y-2 flex-1 max-md:pt-2">
                <Skeleton class="h-4 w-2/3" />
                <Skeleton class="h-3 w-1/3" />
                <Skeleton class="h-3 w-3/5" />
              </div>
            </div>
          </Show>
        </div>
      </Show>
      <div ref={observerRef} class="h-10">
        <Show when={posts().length === 0 && !refreshLoading() && !loading()}>
          <div class="text-center text-gray-500 py-8">Пока нет объявлений</div>
        </Show>
        <Show when={!hasMore() && posts().length > 0}>
          <div class="text-center text-gray-500 py-8">
            Больше нет объявлений
          </div>
        </Show>
      </div>
    </div>
  );
};

export default PublicPosts;
