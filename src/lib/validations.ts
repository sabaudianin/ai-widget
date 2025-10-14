import { z } from "zod";

export const schema = z.object({
  prompt: z
    .string()
    .min(3, "Ask a question")
    .max(200, "Tooo long prompt (200 symbols max"),
});

export type FormValue = z.infer<typeof schema>;
