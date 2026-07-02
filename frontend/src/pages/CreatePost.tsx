import { createSignal, createEffect, Show, Index } from "solid-js";
import { usePermissions, PERMISSIONS } from "../lib/permissions";
import { postApi, api } from "../lib/api";
import { useNavigate, A } from "@solidjs/router";
import type { Post } from "../lib/types";
import { X, Image, ImageOff } from "lucide-solid";

const CreatePost = () => {
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [photo, setPhoto] = createSignal<File | null>(null);
  const [photoPreview, setPhotoPreview] = createSignal<string | null>(null);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [similarPosts, setSimilarPosts] = createSignal<Post[]>([]);

  let nameInputRef: HTMLInputElement | undefined;
  const focusNameInput = () => {
    if (nameInputRef) {
      nameInputRef.focus();
    }
  };

  createEffect(() => {
    focusNameInput();
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name());
    if (description()?.trim()) formData.append("description", description());
    if (photo()) formData.append("photo", photo()!);

    try {
      const data = await api.post<{ post: Post }>("/posts", formData);
      navigate(`/posts/${data.post.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать объявление",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      setPhoto(file);
      refreshSimilarPosts();
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
    }
  };

  const refreshSimilarPosts = () => {
    if (name().trim() == "" && description().trim() == "" && photo() == null) {
      setSimilarPosts([]);
      return;
    }
    postApi
      .getSimilar({
        id: null,
        hasPhoto: false,
        photo: photo(),
        name: name(),
        description: description(),
      })
      .then((r) => setSimilarPosts(r.posts));
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview()) {
      URL.revokeObjectURL(photoPreview()!);
      setPhotoPreview(null);
    }
    refreshSimilarPosts();
  };

  return (
    <>
      {hasPermission(PERMISSIONS.POST_CREATE) && (
        <div class="max-w-2xl mx-auto">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800 text-center">
              Создать объявление
            </h1>
            <p class="text-gray-500 mt-1 text-center">
              {hasPermission(PERMISSIONS.POST_VERIFY)
                ? "Объявление будет опубликовано сразу после отправки"
                : "Объявление будет опубликовано после проверки"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            class="bg-white rounded-2xl shadow-lg p-6 space-y-5"
          >
            {/* Photo upload */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Фото
              </label>

              <Show when={!photoPreview()}>
                <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image />
                    <p class="text-sm text-gray-500">
                      Нажмите для загрузки фото
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      JPEG, PNG, WebP, GIF (макс. 15MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoChange}
                    class="hidden"
                  />
                </label>
              </Show>

              <Show when={photoPreview()}>
                <div class="relative flex justify-center">
                  <img
                    src={photoPreview()!}
                    alt="Preview"
                    class="max-h-100 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition cursor-pointer"
                  >
                    <X />
                  </button>
                </div>
              </Show>
              <p class="text-xs text-gray-500 mt-1">
                Вы можете добавить одно фото
              </p>
            </div>

            <Show when={similarPosts()?.length > 0}>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Похожие объявления
                </label>
                <div class="flex gap-3 overflow-x-auto">
                  <Index each={similarPosts()}>
                    {(post) => (
                      <A
                        class="flex max-w-30 h-30 rounded-xl cursor-pointer relative"
                        target="_blank"
                        href={`/posts/${post().id}`}
                      >
                        <Show when={post().thingReturnedToOwner}>
                          <span class="absolute top-1 right-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Найдено
                          </span>
                        </Show>
                        <Show when={post().hasPhoto}>
                          <img
                            src={`/storage/storage/post_photos/${post().id}.jpeg`}
                            alt={post().name}
                            class="object-cover rounded-xl border-2 border-gray-300 hover:border-blue-500 transition"
                          />
                        </Show>
                        <Show when={!post().hasPhoto}>
                          <div class="flex w-30 h-full justify-center items-center rounded-xl border-2 border-gray-300 hover:border-blue-500 transition flex-col gap-3 p-2">
                            <ImageOff />
                            <span class="truncate max-w-full">
                              {post().name}
                            </span>
                          </div>
                        </Show>
                      </A>
                    )}
                  </Index>
                </div>
              </div>
            </Show>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Название *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name()}
                onInput={(e) => {
                  setName(e.currentTarget.value);
                  refreshSimilarPosts();
                }}
                placeholder="Например: синяя шапка"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                Коротко опишите, что потеряли или нашли
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={description()}
                onInput={(e) => {
                  setDescription(e.currentTarget.value);
                  refreshSimilarPosts();
                }}
                placeholder="Где и когда, особые приметы..."
                rows={5}
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-[140px] max-h-[600px]"
              />
              <p class="text-xs text-gray-500 mt-1">Чем подробнее, тем лучше</p>
            </div>

            {error() && (
              <div class="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200">
                {error()}
              </div>
            )}

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading()}
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading() ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default CreatePost;
