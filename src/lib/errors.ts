export class ApiError extends Error {
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}
