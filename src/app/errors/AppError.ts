export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly message: string;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.message = message; // distinguishes expected errors vs programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}
