import type { Message } from "../../types/types";

export const ChatBubble = ({ m }: { m: Message }) => {
  const isUser = m.role === "user";
  return (
    <section className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`rounded-2xl border p-2 whitespace-pre-wrap break-words text-black ${
          isUser
            ? "border border-black bg-white/90 font-semibold p-4"
            : " bg-slate-300/90 border border-slate-900"
        }`}
      >
        <p className="text-xs">
          {isUser ? "You" : "AI"} - {new Date(m.createdAt).toLocaleTimeString()}
        </p>
        <p>{m.text}</p>
      </article>
    </section>
  );
};
