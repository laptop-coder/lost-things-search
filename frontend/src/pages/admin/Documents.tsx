import { createSignal, createEffect, onMount, For, Show } from "solid-js";
import { PERMISSIONS } from "../../lib/permissions";
import { usePermissions } from "../../lib/permissions";
import { api } from "../../lib/api";
import { FileText, FileCheck } from "lucide-solid";

const Documents = () => {
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal("");

  const { hasPermission } = usePermissions();

  const [hasPrivacy, setHasPrivacy] = createSignal(false);
  const [uploadingPrivacy, setUploadingPrivacy] = createSignal(false);

  onMount(async () => {
    try {
      setLoading(true);
      const response = await fetch("/documents/privacy.pdf", {
        method: "HEAD",
      }); // using fetch instead smth like api.head() because it is not the request to API (with API_BASE)
      setHasPrivacy(response.ok);
    } catch {
      setHasPrivacy(false);
    } finally {
      setLoading(false);
    }
  });

  const handlePrivacyUpload = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    setUploadingPrivacy(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.put("/documents/privacy", formData);
      setHasPrivacy(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось загрузить политику конфиденциальности",
      );
    } finally {
      setUploadingPrivacy(false);
    }
  };

  return (
    <div class="space-y-6 p-4">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Управление документами</h1>
        <p class="text-gray-500 mt-1">Загрузка документов</p>
      </div>

      <Show when={error()}>
        <div class="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl">
          {error()}
        </div>
      </Show>

      <Show when={loading()}>
        <div class="text-center py-12 text-gray-500">Загрузка...</div>
      </Show>

      <Show when={!loading() && !error()}>
        {/* Privacy uploading */}
        <Show when={hasPermission(PERMISSIONS.DOCUMENT_PRIVACY_UPLOAD)}>
          <Show when={uploadingPrivacy()}>
            <div class="text-center py-12 text-gray-500">
              Загрузка документа...
            </div>
          </Show>
          <Show when={!uploadingPrivacy()}>
            <div class="bg-white rounded-2xl shadow-lg p-6 max-w-md">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                Политика конфиденциальности
              </h2>
              <div class="flex gap-3 flex-col">
                <Show when={hasPrivacy()}>
                  <div class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3">
                    <FileCheck />
                    <span>Документ загружен</span>
                  </div>
                </Show>
                <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText />
                    <p class="text-sm text-gray-500">
                      Нажмите для {hasPrivacy() ? "замены" : "загрузки"} файла
                    </p>
                    <p class="text-xs text-gray-400 mt-1">PDF (макс. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePrivacyUpload}
                    class="hidden"
                  />
                </label>
              </div>
            </div>
          </Show>
        </Show>
      </Show>
    </div>
  );
};

export default Documents;
