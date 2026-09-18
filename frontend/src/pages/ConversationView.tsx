import { createSignal, onMount, Index, Show, createEffect } from "solid-js";
import { A } from "@solidjs/router";
import { useParams, useNavigate } from "@solidjs/router";
import { conversationApi } from "../lib/api";
import { Conversation, Message } from "../lib/types";
import { useAuth } from "../lib/auth";
import { refreshUnreadMessagesCount } from "../lib/store";
import { ChevronLeft, ChevronRight, NotepadText, ArrowUp } from "lucide-solid";
import { Motion } from "solid-motionone";
import Spinner from "../components/Spinner";

const ConversationView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [conversation, setConversation] = createSignal<Conversation | null>(
    null,
  );
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [newMessage, setNewMessage] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  const [sending, setSending] = createSignal(false);
  const [error, setError] = createSignal("");

  let messagesEndRef: HTMLDivElement | undefined;
  let messageInputRef: HTMLInputElement | undefined;

  const loadConversation = async () => {
    try {
      const data = await conversationApi.getById(params.id!);
      setConversation(data.conversation);
      setMessages(data.conversation.messages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка загрузки переписки",
      );
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  onMount(async () => {
    if (!params.id) return;
    await loadConversation();
    scrollToBottom();
    await conversationApi.markAsRead(params.id);
    await refreshUnreadMessagesCount();
  });

  const focusMessageInput = () => {
    if (messageInputRef && window.innerWidth >= 768) {
      messageInputRef.focus();
    }
  };

  createEffect(() => {
    focusMessageInput();
  });

  const sendMessage = async (e: Event) => {
    e.preventDefault();
    if (!newMessage().trim() || !auth.user()) return;

    setSending(true);
    try {
      const sentMessage = await conversationApi.sendMessage(
        params.id!,
        newMessage().trim(),
      );
      setNewMessage("");
      setMessages([
        ...messages(),
        {
          ...sentMessage.message,
          senderId: auth.user()!.id,
        },
      ]);
      scrollToBottom();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка отправки сообщения",
      );
    } finally {
      setSending(false);
      focusMessageInput();
    }
  };

  const otherUser = () => conversation()?.otherUser;
  const post = () => conversation()?.post;

  return (
    <div class="max-w-4xl mx-auto h-full md:h-[calc(100vh-120px)] flex flex-col bg-surface rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div class="border-b border-border p-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/conversations")}
          type="button"
          class="text-text hover:text-text-muted cursor-pointer flex flex-row"
        >
          <ChevronLeft /> <span class="hidden md:block">Назад</span>
        </button>
        <Show when={otherUser()}>
          <A
            href={`/users/${otherUser()!.id}`}
            class="flex flex-1 transition gap-2 rounded-2xl"
          >
            <img
              src={
                otherUser()!.hasAvatar
                  ? `/storage/storage/avatars/${otherUser()!.id}.jpeg`
                  : "/storage/assets/default_avatar.jpeg"
              }
              alt={`Фото профиля пользователя ${otherUser()!.firstName} ${otherUser()!.lastName}`}
              class="w-10 h-10 rounded-full object-cover border-2 border-border hover:brightness-95 transition"
            />

            <div>
              <h2 class="font-semibold text-text">
                {otherUser()!.firstName} {otherUser()!.lastName}
              </h2>
              <p class="text-sm text-text">{post()?.name}</p>
            </div>
          </A>
        </Show>
        <Show when={post()}>
          <button
            onClick={() => navigate(`/posts/${post()!.id}`)}
            type="button"
            class="text-text hover:text-text-muted cursor-pointer flex flex-row"
          >
            <span class="hidden md:flex">
              Перейти к объявлению <ChevronRight />
            </span>
            <NotepadText class="flex md:hidden" />
          </button>
        </Show>
      </div>

      {/* Messages */}
      <div class="flex-1 overflow-y-auto p-4">
        <Show when={loading()}>
          <div class="flex items-center justify-center h-full">
            <Spinner />
          </div>
        </Show>

        <Show when={error()}>
          <div class="bg-urgent-bg text-urgent p-3 rounded-xl">{error()}</div>
        </Show>
        <div class="flex flex-col justify-end min-h-full">
          <div class="space-y-3">
            <Index each={messages()}>
              {(msg, index) => {
                const isOwn = msg().senderId === auth.user()?.id;

                // Date
                const prev = index > 0 ? messages()[index - 1] : null;
                const prevDate = prev
                  ? new Date(prev.createdAt).toLocaleDateString("ru")
                  : null;
                const curDate = new Date(msg().createdAt).toLocaleDateString(
                  "ru",
                );
                const showDate = prevDate !== curDate;

                return (
                  <>
                    <Show when={showDate}>
                      <div class="text-center text-xs text-text py-2">
                        {curDate}
                      </div>
                    </Show>
                    <div
                      class={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div class={`max-w-[70%] ${isOwn ? "order-2" : ""}`}>
                        <Motion.div
                          class={`rounded-2xl px-4 py-2 ${
                            isOwn ? "bg-surface-2 text-text" : "bg-bg text-text"
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p class="text-sm">{msg().content}</p>
                        </Motion.div>
                        <p class="text-xs text-text mt-1">
                          {new Date(msg().createdAt).toLocaleTimeString("ru", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </>
                );
              }}
            </Index>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        class="border-t border-border p-4 flex gap-2"
      >
        <input
          ref={messageInputRef}
          type="text"
          value={newMessage()}
          onInput={(e) => setNewMessage(e.currentTarget.value)}
          placeholder="Сообщение..."
          disabled={sending()}
          class="w-full px-4 py-2 border border-border rounded-xl  disabled:opacity-50 text-text"
        />
        <button
          type="submit"
          disabled={sending() || !newMessage().trim()}
          class="max-md:aspect-square flex items-center justify-center md:px-5 py-2 bg-accent text-bg rounded-xl hover:bg-accent-hover disabled:opacity-50 transition font-medium cursor-pointer disabled:cursor-not-allowed"
        >
          <span class="hidden md:flex md:items-center md:justify-center">
            Отправить
          </span>
          <ArrowUp class="md:hidden flex items-center justify-center aspect-square" />
        </button>
      </form>
    </div>
  );
};

export default ConversationView;
