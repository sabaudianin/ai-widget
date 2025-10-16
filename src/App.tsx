import React from "react";

import { QuestionForm } from "./components/QuestionForm/QuestionForm";
import { ChatHistory } from "./components/ChatHistory/ChatHistory";

export default function App(): React.ReactElement {
  return (
    <div className="h-screen mx-auto max-w-5xl py-2  flex flex-col justify-center items-center gap-2 text-sm lg:text-2xl">
      <ChatHistory />

      <QuestionForm />
    </div>
  );
}
