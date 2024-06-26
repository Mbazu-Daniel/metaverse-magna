type ApiErrorDetail = {
  field?: string;
  message: string | string;
};
class ApiError extends Error {
  statusCode: number;
  data: null;
  success: boolean;
  errors: ApiErrorDetail[];

  constructor(
    statusCode: number,
    message = "something went wrong",
    errors: ApiErrorDetail[] = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
