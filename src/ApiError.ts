class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    // Capture stack (best-effort across environments)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static from(err: any) {
    if (err instanceof ApiError) return err;
    const status = err?.statusCode ?? err?.status ?? 500;
    const message = err?.message ?? 'Something went wrong';
    const details = err?.errors ?? err?.details;
    return new ApiError(status, message, details);
  }
}

export default ApiError;
