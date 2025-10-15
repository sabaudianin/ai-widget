import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { FormValue } from "./lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./lib/validations";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import { postPrompt, type AiResponse } from "./lib/api";
import type { Message } from "./types/types";
import { ChatBubble } from "./components/ChatBubble/ChatBubble";

type Role = "user" | "ai";

export default function App(): React.ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValue>({
    defaultValues: { prompt: "" },
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // useEffect(() => {
  //   return () => abortRef.current?.abort();
  // });

  const makeMsg = useCallback((role: Role, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uuid(), role, text, createdAt: Date.now() },
    ]);
  }, []);

  const stopFetch = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      toast.message("request Aborted");
    }
  }, []);

  const onSubmit = useCallback(
    async (values: FormValue) => {
      const prompt = values.prompt.trim();
      if (!prompt) return;

      makeMsg("user", prompt);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res: AiResponse = await postPrompt(
          prompt,
          abortRef.current.signal
        );
        const aiText = (res.text ?? "").trim() || "(empty response)";
        makeMsg("ai", aiText);
        reset({ prompt: "" });
      } catch (err: unknown) {
        // Sprawdzenie, czy błąd jest wynikiem celowego anulowania
        if (
          err instanceof Error &&
          (err.name === "AbortError" ||
            err.message === "signal is aborted without reason")
        ) {
          // IGNORE: Celowe anulowanie żądania (np. przez stopFetch lub nowe zapytanie)
          console.log("Request aborted by user or new prompt.");
          // Zwykle tutaj dodajesz komunikat do czatu, że AI się poddało, np:
          makeMsg("ai", " *(Generacja przerwana)*");
          return;
        }

        // Błąd krytyczny (sieć, API 500/400)
        const message =
          err instanceof Error ? err.message : "AI request failed";
        toast.error(message);
      }
    },
    [makeMsg, reset]
  );

  return (
    <div className="mx-auto max-w-3xl p-4 mt-2 flex flex-col justify-end items-center">
      <section className=" max-h-[50vh] rounded border p-2 overflow-auto shadow-sm w-full border border-blue-500">
        {messages.length === 0 ? (
          <p className=" text-center text-sm ">
            Ask something the answer will show up here
          </p>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              m={msg}
            />
          ))
        )}
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col items-center justify-center  gap-2 rounded-2xl border border-zinc-200  p-3 shadow-sm bg-blue-300 text-black"
      >
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ask Here..."
          {...register("prompt")}
        />
        {errors.prompt && (
          <p className=" text-red-600"> {errors.prompt.message}</p>
        )}
        <button
          type="submit"
          className="w-1/4 inline-flex items-center justify-center rounded-xl border border-zinc-300  px-4 py-2 text-sm font-medium bg-green-400 hover:bg-green-800  disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting" : "Submit"}
        </button>
        <button
          className="bg-red-300 p-2 rounded text-sm"
          type="button"
          onClick={stopFetch}
          disabled={!isSubmitting}
        >
          Stop
        </button>
      </form>
    </div>
  );
}
