import type { Message } from "../../types/types";

export const ChatBubble = ({ m }: { m: Message }) => {
  const isUser = m.role === "user";
  return (
    <section className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded border p-2 ${
          isUser ? "border-green-500" : "border-red-500"
        }`}
      >
        <p>
          {isUser ? "You" : "AI"} - {new Date(m.createdAt).toLocaleDateString()}
        </p>
        <p>{m.text}</p>
      </div>
    </section>
  );
};
