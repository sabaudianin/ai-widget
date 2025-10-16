import React from "react";
import { useQuestionForm } from "../../hooks/useQuestionForm";

export const QuestionForm = () => {
  const { register, handleSubmit, errors, isSubmitting, onSubmit, stopFetch } =
    useQuestionForm();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col items-center justify-center gap-4 shadow-sm text-black px-1"
    >
      <input
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 focus:placeholder:text-transparent
           "
        placeholder="Ask Here..."
        {...register("prompt")}
      />
      {errors.prompt && (
        <p className=" text-red-600"> {errors.prompt.message}</p>
      )}
      <div className="flex justify-center gap-6 items-center w-full">
        <button
          className=" inline-flex bg-red-300 py-2 px-2 rounded "
          type="button"
          onClick={stopFetch}
          disabled={!isSubmitting}
        >
          Stop
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded py-2 px-8 font-medium bg-green-400 hover:bg-green-700  disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <p className="flex justify-center items-center gap-4">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 motion-safe:animate-spin"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>...Thinking...</span>
            </p>
          ) : (
            <span>Ask a Question</span>
          )}
        </button>
      </div>
    </form>
  );
};
