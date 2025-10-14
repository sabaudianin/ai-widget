import type { Message } from "../../types/types";

export const ChatBubble = ({ m }: { m: Message }) => {
  const isUser = m.role === "user";
  return (
    <section className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`rounded-2xl border p-2 whitespace-pre-wrap break-words bg-green-200 text-black ${
          isUser ? "border-green-500 bg-green-200" : "border-red-500 bg-red-200"
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
