import React, { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import type { ParsedReceipt } from "./useParseReceipt";
import { parseReceipt } from "./useParseReceipt";
import { pipeline, type Pipeline, RawImage } from "@xenova/transformers";
import { Toaster, toast } from "sonner";

type StatusState =
  | "idle"
  | "loading_model"
  | "warmup"
  | "running"
  | "done"
  | "error";

interface Status {
  state: StatusState;
  msLoad?: number;
  msRun?: number;
  message?: string;
}

// Konwersja File -> HTMLImageElement
async function fileToHTMLImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
    // img.decoding = "async"; // czasem pomaga w Safari/Firefox
  });
}

// HTMLImageElement -> RawImage (przez canvas + ImageData)

function htmlImageToRawImage(img: HTMLImageElement): RawImage {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // ImageData jest RGBA -> channels = 4
  return new RawImage(imageData.data, imageData.width, imageData.height, 4);
}

export default function App(): JSX.Element {
  const ocrRef = useRef<Pipeline | null>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);

  // miniaturka podglądu
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Inicjalizacja + warm-up
  async function ensurePipeline(): Promise<Pipeline> {
    if (ocrRef.current) return ocrRef.current;

    const t0 = performance.now();
    setStatus({ state: "loading_model" });

    const p = await pipeline("image-to-text", "Xenova/trocr-base-printed");

    const t1 = performance.now();
    setStatus({ state: "warmup" });

    try {
      // Warm-up: użyj surowych pikseli 1x1 (RGB, channels=3) — zero problemów z TS
      const tiny = new Uint8ClampedArray(1 * 1 * 3); // wypełnione zerami (czarny)
      const warmRaw = new RawImage(tiny, 1, 1, 3);
      await p(warmRaw, { max_new_tokens: 1 });
    } catch {
      // Warmup może nie być wymagany — jeśli nie wspierane, ignorujemy
    }

    const t2 = performance.now();
    setStatus({ state: "idle", msLoad: Math.round(t1 - t0) });

    ocrRef.current = p;
    return p;
  }

  async function onRun(): Promise<void> {
    try {
      if (!file) {
        toast("Upload a receipt image first");
        return;
      }
      const p = await ensurePipeline();

      setStatus((s) => ({ ...s, state: "running" }));
      const t0 = performance.now();

      const imgEl = await fileToHTMLImageElement(file);
      const raw = htmlImageToRawImage(imgEl);

      const out = await p(raw, { max_new_tokens: 128 });

      type OCRResult = { generated_text?: string };
      const result =
        typeof out === "string"
          ? out
          : Array.isArray(out)
          ? (out[0] as OCRResult)?.generated_text ?? ""
          : String(out ?? "");

      const t1 = performance.now();

      setText(result);
      setParsed(parseReceipt(result));
      setStatus((s) => ({ ...s, state: "done", msRun: Math.round(t1 - t0) }));
      toast.success("Text extracted");
    } catch (e: unknown) {
      console.error(e);
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Failed to run OCR";
      setStatus({ state: "error", message });
      toast.error(message);
    }
  }

  function onClear(): void {
    setFile(null);
    setText("");
    setParsed(null);
    setStatus({ state: "idle" });
  }

  return (
    <div className="w-full h-screen max-w-6xl space-y-6 p-2 flex flex-col justify-center items-center text-center mx-auto  ">
      <Toaster
        position="bottom-center"
        richColors
      />

      <header className="space-y-6">
        <h1 className="text-2xl lg:text-6xl font-bold text-center">
          Receipt Reader
        </h1>
        <p className="text-sm text-gray-300 lg:text-xl">
          Runs entirely in your browser using Transformers.js (TrOCR). No server
          required.
        </p>
      </header>

      <section className="space-y-3">
        <label className="block text-sm font-medium lg:text-xl">
          Upload receipt image (JPG/PNG)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm lg:text-xl file:mr-4 file:rounded-md file:border-0 file:bg-blue-400 file:px-4 file:py-2 file:text-white hover:file:bg-black"
        />
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-2 max-h-64 lg:max-h-128 w-auto rounded-md border object-contain"
          />
        )}
      </section>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRun}
          disabled={
            !file ||
            status.state === "running" ||
            status.state === "loading_model"
          }
          className="rounded-md bg-green-500 px-4 py-2 text-white disabled:opacity-50 lg:text-xl"
        >
          {status.state === "loading_model"
            ? "Downloading model…"
            : status.state === "running"
            ? "Running…"
            : "Extract text"}
        </button>
        <button
          onClick={onClear}
          className="rounded-md border px-4 py-2 bg-red-400 lg:text-xl"
        >
          Clear
        </button>
      </div>

      <StatusBar status={status} />

      {!!text && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">OCR Text</h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(text);
                toast("Copied to clipboard");
              }}
              className="text-sm underline"
            >
              Copy
            </button>
          </div>
          <textarea
            className="h-48 w-full rounded-md border p-3 font-mono text-sm"
            readOnly
            value={text}
          />
        </section>
      )}

      {!!parsed && (
        <section className="space-y-2">
          <h2 className="font-semibold">Parsed fields</h2>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <tbody>
                <Row
                  label="Total"
                  value={parsed.total}
                />
                <Row
                  label="Date"
                  value={parsed.date}
                />
                <Row
                  label="NIP"
                  value={parsed.nip}
                />
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Heuristics only improve with locales,better regex,or a fine-tuned
            model later.
          </p>
        </section>
      )}

      <footer className="pt-4 text-xs text-gray-500">
        Model: <code>Xenova/trocr-base-printed</code>
        <code>@xenova/transformers 3.7.5</code>,{" "}
        <code>onnxruntime-web 1.23.0</code>
        {status.msLoad != null && <> • Load {status.msLoad}ms</>}
        {status.msRun != null && <> • Inference {status.msRun}ms</>}
      </footer>
    </div>
  );
}

function StatusBar({ status }: { status: Status }): JSX.Element {
  const text =
    status.state === "idle"
      ? "Ready"
      : status.state === "loading_model"
      ? "Downloading model files…"
      : status.state === "warmup"
      ? "Warming up…"
      : status.state === "running"
      ? "Running OCR…"
      : status.state === "done"
      ? "Done"
      : `Error — ${status.message ?? "check console / try again"}`;

  const tone =
    status.state === "error"
      ? "text-red-600"
      : status.state === "running" ||
        status.state === "loading_model" ||
        status.state === "warmup"
      ? "text-blue-600"
      : "text-gray-600";

  return <p className={`text-sm lg:text-xl ${tone}`}>{text}</p>;
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): JSX.Element {
  return (
    <tr className="border-b last:border-0">
      <td className="w-32 bg-gray-50 px-3 py-2 font-medium">{label}</td>
      <td className="px-3 py-2">
        {value ?? <span className="text-gray-400">n/a</span>}
      </td>
    </tr>
  );
}
