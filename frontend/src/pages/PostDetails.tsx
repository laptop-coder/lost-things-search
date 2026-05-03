import { createSignal, Show, onMount } from "solid-js";
import { usePermissions, PERMISSIONS } from "../lib/permissions";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useParams } from "@solidjs/router";
import type { Post } from "../lib/types";
import PostCardDetailed from "../components/PostCardDetailed";
import Skeleton from "../components/Skeleton";

const PostDetails = () => {
  const params = useParams();
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  const { hasPermission } = usePermissions();
  const auth = useAuth();
  const [post, setPost] = createSignal<Post | null>(null);

  const loadPost = async () => {
    try {
      const data = await api.get<{ post: Post }>(`/posts/${params.id}`);
      setPost(data.post);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить объявление",
      );
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    loadPost();
  });

  return (
    <div class="max-w-4xl mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-gray-800 text-center mb-6">
        Информация об объявлении
      </h1>
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
      <Show when={error()}>
        <div class="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200">
          {error()}
        </div>
      </Show>
      <Show when={!loading() && post()}>
        <Show
          when={
            post()!.verified ||
            hasPermission(PERMISSIONS.POST_READ_ANY) ||
            (hasPermission(PERMISSIONS.POST_READ_OWN) &&
              post()!.author.id === auth.user()?.id)
          }
        >
          <PostCardDetailed post={post()!} onChange={loadPost} />
        </Show>
      </Show>
    </div>
  );
};

export default PostDetails;
