export class CustomError extends Error {
  status: number;
  isOperational: boolean;

  constructor(
    message: string,
    status: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
