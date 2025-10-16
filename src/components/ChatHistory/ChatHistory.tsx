import React from "react";
import { useQuestionForm } from "../../hooks/useQuestionForm";
import { ChatBubble } from "../ChatBubble/ChatBubble";

export const ChatHistory = () => {
  const { messages } = useQuestionForm();
  return (
    <section className="rounded p-2 overflow-auto shadow-sm w-full">
      {messages.length === 0 ? (
        <p className="text-center text-xs lg:text-sm ">
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
  );
};
