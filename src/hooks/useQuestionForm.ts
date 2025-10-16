import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { zodResolver } from "@hookform/resolvers/zod";

import type { FormValue } from "../lib/validations";
import { schema } from "../lib/validations";
import type { Message } from "../types/types";
import { toast } from "sonner";
import { postPrompt, type AiResponse } from "../lib/api";

type Role = "user" | "ai";

export const useQuestionForm = () => {
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
        if (
          err instanceof Error &&
          (err.name === "AbortError" ||
            err.message === "signal is aborted without reason")
        ) {
          console.log("Request aborted by user or new prompt.");

          makeMsg("ai", " *(Generacja przerwana)*");
          return;
        }

        const message =
          err instanceof Error ? err.message : "AI request failed";
        toast.error(message);
      }
    },
    [makeMsg, reset]
  );

  return {
    register,
    handleSubmit,
    reset,
    errors,
    isSubmitting,
    onSubmit,
    stopFetch,
    messages,
  };
};
