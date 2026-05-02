import { createSignal, Show, onCleanup, onMount, type Setter } from "solid-js";
import QRCode from "qrcode";
import { QrCode } from "lucide-solid";
import { Motion, Presence } from "solid-motionone";

interface Props {
  text: string;
  setError: Setter<string>;
}

const QRCodeButton = (props: Props) => {
  const [showQR, setShowQR] = createSignal(false);
  const [qrDataUrl, setQrDataUrl] = createSignal("");

  const generateQR = async () => {
    if (qrDataUrl()) {
      setShowQR(!showQR());
      return;
    }
    try {
      const url = await QRCode.toDataURL(props.text);
      setQrDataUrl(url);
      setShowQR(true);
    } catch (err) {
      props.setError(
        err instanceof Error ? err.message : "Не удалось сгенерировать QR-код",
      );
    }
  };

  const closeQR = () => setShowQR(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && showQR()) {
      closeQR();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  return (
    <>
      <button
        onClick={generateQR}
        class="aspect-square w-10 h-10 ml-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition cursor-pointer flex items-center justify-center"
        title="Показать QR-код"
      >
        <QrCode />
      </button>

      <Presence>
        <Show when={showQR()}>
          <Motion.div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeQR}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Motion.div
              class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <img src={qrDataUrl()} alt="QR Code" class="w-64 h-64" />
              <div class="mt-2 text-center">
                <button
                  onClick={closeQR}
                  class="px-4 h-10 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        </Show>
      </Presence>
    </>
  );
};

export default QRCodeButton;
