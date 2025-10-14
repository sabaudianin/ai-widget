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

  useEffect(() => {
    return () => abortRef.current?.abort();
  });

  const makeMsg = useCallback((role: Role, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uuid(), role, text, createdAt: Date.now() },
    ]);
  }, []);

  const onSubmit = useCallback(
    async (values: FormValue) => {
      const prompt = values.prompt.trim();
      if (!prompt) return;

      makeMsg("user", prompt);
    },
    [makeMsg]
  );

  return (
    <div className="mx-auto max-w-3xl p-4">
      <section className="rounded border p-2 shadow-sm">
        {!messages ? (
          <p>Ask something the answer will show up here</p>
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
        className="flex gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
      ></form>
    </div>
  );
}
