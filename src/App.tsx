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

      console.log(prompt);
      reset();
    },
    [makeMsg]
  );

  return (
    <div className="mx-auto h-screen max-w-3xl p-4 mt-2 flex flex-col justify-center items-center">
      <section className=" max-h-[50vh] rounded border p-2 shadow-sm w-full bg-slate-600 border border-blue-500">
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
      </form>
    </div>
  );
}
