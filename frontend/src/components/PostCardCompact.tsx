import { Show, createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { type Post, PostModerationStatus } from "../lib/types";
import { usePermissions, PERMISSIONS } from "../lib/permissions";
import { api, conversationApi } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate } from "../lib/utils";
import { A, useNavigate } from "@solidjs/router";
import { ChevronRight } from "lucide-solid";
import { Motion, Presence } from "solid-motionone";
import PostStatusBadge from "./PostStatusBadge";

interface Props {
  post: Post;
  onChange?: () => void;
}

const PostCardCompact = (props: Props) => {
  const auth = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [contactLoading, setContactLoading] = createSignal(false);
  const [contactMessage, setContactMessage] = createSignal("");
  const [showModal, setShowModal] = createSignal(false);
  const navigate = useNavigate();

  const openModal = async () => {
    setShowModal(true);
    focusMessageInput();
  };

  const closeModal = () => {
    setShowModal(false);
    setContactMessage("");
    setError("");
    setContactLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && showModal()) {
      closeModal();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const contactAuthor = async () => {
    try {
      if (!contactMessage().trim()) {
        setError("Введите сообщение");
        return;
      }
      setContactLoading(true);
      const data = await conversationApi.create(
        props.post.id,
        contactMessage(),
      );
      navigate(`/conversations/${data.conversationId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось начать переписку",
      );
    } finally {
      setContactLoading(false);
    }
  };

  const changePostModerationStatus = async (
    newStatus: PostModerationStatus,
  ) => {
    try {
      setLoading(true);
      const formData = new URLSearchParams();
      formData.append("moderationStatus", newStatus);
      await api.patch<{ posts: Post[] }>(
        `/posts/${props.post.id}/moderation`,
        formData,
      );
      props.onChange?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось изменить статус модерации объявления",
      );
    } finally {
      setLoading(false);
    }
  };

  const markReturned = async () => {
    if (confirm("Закрыть объявление? Это действие необратимо.")) {
      try {
        setLoading(true);
        await api.patch<{ posts: Post[] }>(`/posts/${props.post.id}/return`);
        props.onChange?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не удалось закрыть объявление",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  let messageInputRef: HTMLInputElement | undefined;

  const focusMessageInput = () => {
    if (messageInputRef) {
      messageInputRef.focus();
    }
  };

  createEffect(() => {
    focusMessageInput();
  });

  const deletePost = async () => {
    if (confirm("Удалить объявление? Это действие необратимо.")) {
      try {
        setLoading(true);
        await api.delete<{}>(`/posts/${props.post.id}`);
        props.onChange?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не удалось удалить объявление",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Motion.div
      class={`rounded-2xl shadow-md hover:shadow-xl overflow-hidden w-full ${props.post.thingReturnedToOwner ? "bg-gray-100 opacity-75" : "bg-white"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div class="p-5">
        <div class="flex flex-col md:flex-row items-start gap-4 w-full">
          <A
            href={`/users/${props.post.author.id}`}
            class="w-10 h-10 flex bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            <img
              class={`w-10 h-10 rounded-full object-cover border-2 border-gray-100 hover:brightness-95 transition flex-shrink-0 ${props.post.thingReturnedToOwner ? "grayscale" : ""}`}
              src={
                props.post.author.hasAvatar
                  ? `/storage/storage/avatars/${props.post.author.id}.jpeg`
                  : "/storage/assets/default_avatar.jpeg"
              }
              alt="Фото профиля"
            />
          </A>
          <div class="flex-1 min-w-0 w-full">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h3
                class={`text-wrap text-lg font-semibold truncate ${props.post.thingReturnedToOwner ? "text-gray-500 line-through" : "text-gray-800"}`}
              >
                {props.post.name}
              </h3>
              <div class="flex items-center gap-2">
                <Show when={props.post.thingReturnedToOwner}>
                  <PostStatusBadge
                    moderationStatus={props.post.moderation.status}
                    thingReturnedToOwner={props.post.thingReturnedToOwner}
                  />
                </Show>
              </div>
            </div>

            <div class="flex flex-col md:flex-row items-start md:items-center md:gap-3 mt-1 text-sm text-gray-500">
              <span>
                {props.post.author.firstName} {props.post.author.lastName}
              </span>
              <span class="hidden md:flex">•</span>
              <span>
                Последнее изменение: {formatDate(props.post.updatedAt)}
              </span>
            </div>

            <Show when={props.post.hasPhoto}>
              <div class="mt-7 mb-5 flex justify-center">
                <img
                  src={`/storage/storage/post_photos/${props.post.id}.jpeg`}
                  alt="Фото объявления"
                  class={`max-h-100 object-contain rounded-xl ${props.post.thingReturnedToOwner ? "grayscale opacity-50" : ""}`}
                />
              </div>
            </Show>

            <Show when={props.post.description}>
              <p
                class={`mt-2 text-sm line-clamp-2 whitespace-pre-wrap ${props.post.thingReturnedToOwner ? "text-gray-400" : "text-gray-600"}`}
              >
                {props.post.description}
              </p>
            </Show>

            <div class="mt-4 flex flex-col sm:flex-row justify-between gap-3 w-full">
              <div class="flex gap-3 flex-wrap">
                <Show
                  when={
                    auth.user() &&
                    auth.user()?.id !== props.post.author.id &&
                    hasPermission(PERMISSIONS.CONVERSATION_MESSAGE_SEND)
                  }
                >
                  <button
                    onClick={openModal}
                    disabled={contactLoading()}
                    type="button"
                    class="w-full sm:w-auto px-3 h-10 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition font-medium cursor-pointer"
                  >
                    Связаться с автором
                  </button>
                </Show>
                <Show
                  when={
                    hasPermission(PERMISSIONS.POST_VERIFY) &&
                    ![
                      PostModerationStatus.Approved,
                      PostModerationStatus.AutoApproved,
                    ].includes(props.post.moderation.status)
                  }
                >
                  <>
                    <button
                      onClick={() =>
                        changePostModerationStatus(
                          PostModerationStatus.Approved,
                        )
                      }
                      disabled={loading()}
                      type="button"
                      class="w-full sm:w-auto px-3 h-10 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition font-medium cursor-pointer"
                    >
                      Опубликовать
                    </button>
                    <button
                      onClick={() =>
                        changePostModerationStatus(
                          PostModerationStatus.Rejected,
                        )
                      }
                      disabled={loading()}
                      type="button"
                      class="w-full sm:w-auto px-3 h-10 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition font-medium cursor-pointer"
                    >
                      Отклонить
                    </button>
                  </>
                </Show>
                <Show
                  when={
                    (hasPermission(PERMISSIONS.POST_MARK_RETURNED_ANY) ||
                      (hasPermission(PERMISSIONS.POST_MARK_RETURNED_OWN) &&
                        props.post.author.id === auth.user()?.id)) &&
                    [
                      PostModerationStatus.Approved,
                      PostModerationStatus.AutoApproved,
                    ].includes(props.post.moderation.status) &&
                    !props.post.thingReturnedToOwner
                  }
                >
                  <button
                    onClick={markReturned}
                    disabled={loading()}
                    type="button"
                    class="w-full sm:w-auto px-3 h-10 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition font-medium cursor-pointer"
                  >
                    Отметить найденным
                  </button>
                </Show>
                <Show
                  when={
                    (hasPermission(PERMISSIONS.POST_DELETE_ANY) ||
                      (hasPermission(PERMISSIONS.POST_DELETE_OWN) &&
                        props.post.author.id === auth.user()?.id)) &&
                    props.post.thingReturnedToOwner
                  }
                >
                  <button
                    onClick={deletePost}
                    disabled={loading()}
                    type="button"
                    class="w-full sm:w-auto px-3 h-10 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition font-medium cursor-pointer"
                  >
                    Удалить
                  </button>
                </Show>
              </div>
              <div class="flex gap-3 flex-wrap">
                <button
                  onClick={() =>
                    (window.location.href = `/posts/${props.post.id}`)
                  }
                  type="button"
                  class="w-full sm:w-auto px-3 h-10 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition font-medium cursor-pointer inline-flex items-center justify-center"
                >
                  Подробнее <ChevronRight />
                </button>
              </div>
            </div>

            <Show when={error()}>
              <div class="mt-3 text-red-600 text-sm">{error()}</div>
            </Show>
          </div>
        </div>
      </div>

      {/*TODO: this code duplicates the code from the PostCardDetailed.tsx*/}
      <Presence>
        <Show when={showModal()}>
          <Motion.div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Motion.div
              class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <h2 class="text-xl font-bold text-gray-800">
                  Связаться с автором
                </h2>
                <p class="text-sm text-gray-500">
                  {props.post.author.firstName} {props.post.author.lastName} ·{" "}
                  {props.post.name}
                </p>
              </div>

              {/* Body */}
              <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5 flex flex-col">
                <Show when={error()}>
                  <div class="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                    {error()}
                  </div>
                </Show>
                <input
                  ref={messageInputRef}
                  disabled={contactLoading()}
                  type="text"
                  value={contactMessage()}
                  onInput={(e) => {
                    setContactLoading(false);
                    setError("");
                    setContactMessage(e.target.value);
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (contactLoading()) return;
                      await contactAuthor();
                    }
                  }}
                  placeholder="Введите сообщение..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Footer */}
              <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={contactAuthor}
                  disabled={contactLoading()}
                  class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {contactLoading() ? "Отправка..." : "Отправить"}
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        </Show>
      </Presence>
    </Motion.div>
  );
};

export default PostCardCompact;
