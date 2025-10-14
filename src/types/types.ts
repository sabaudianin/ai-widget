export type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  createdAt: number;
};
