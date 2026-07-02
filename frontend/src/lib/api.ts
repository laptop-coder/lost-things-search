import { ConversationListItem, Conversation, Message, Post } from "./types";

const getBackendURL = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return import.meta.env.VITE_API_URL || "http://127.0.0.1:37190/api/v1";
  }
  return `${window.location.protocol}//${hostname}:${port}/api/v1`;
};

const API_BASE = getBackendURL();

type RequestOptions = {
  headers?: HeadersInit;
  body?: BodyInit | Record<string, string>;
  method?: string;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { headers = {}, body, method = "GET" } = options;

  const fetchOptions: RequestInit = {
    method,
    credentials: "include",
    headers: {
      ...headers,
    },
  };

  if (body) {
    if (body instanceof FormData || body instanceof URLSearchParams) {
      fetchOptions.body = body;
    } else {
      fetchOptions.body = new URLSearchParams(body as Record<string, string>);
      fetchOptions.headers = {
        ...fetchOptions.headers,
        "Content-Type": "application/x-www-form-urlencoded",
      };
    }
  }

  const response = await fetch(`${API_BASE}${path}`, fetchOptions);

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(
    path: string,
    body?: Record<string, string> | FormData | URLSearchParams,
  ) => request<T>(path, { method: "POST", body }),

  patch: <T>(
    path: string,
    body?: Record<string, string> | FormData | URLSearchParams,
  ) => request<T>(path, { method: "PATCH", body }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  put: <T>(
    path: string,
    body?: Record<string, string> | FormData | URLSearchParams,
  ) => request<T>(path, { method: "PUT", body }),
};

// TODO: make for other modules like here
export const conversationApi = {
  getListOwn: () =>
    api.get<{ conversations: ConversationListItem[] }>("/conversations"),
  getById: (id: string) =>
    api.get<{ conversation: Conversation }>(`/conversations/${id}`),
  getTotalUnreadCount: () =>
    api.get<{ unreadCount: number }>(`/conversations/unread_count`),
  create: (postId: string, message: string) =>
    api.post<{ conversationId: string }>(`/posts/${postId}/contact`, {
      message,
    }),
  sendMessage: (convId: string, message: string) =>
    api.post<{ message: Message }>(`/conversations/${convId}/messages`, {
      message,
    }),
  markAsRead: (convId: string) =>
    api.patch(`/conversations/${convId}/messages/read`),
};

export const postApi = {
  getSimilar: ({
    id,
    hasPhoto,
    photo,
    name,
    description,
  }: {
    id: string | null;
    hasPhoto: boolean;
    photo: File | null;
    name: string | null;
    description: string | null;
  }) => {
    const formData = new FormData();
    if (id?.trim()) formData.append("id", id);
    formData.append("hasPhoto", hasPhoto.toString());
    if (name?.trim()) formData.append("name", name);
    if (description?.trim()) formData.append("description", description);
    if (photo) formData.append("photo", photo);
    return api.post<{ posts: Post[] }>("/posts/similar", formData);
  },
};
