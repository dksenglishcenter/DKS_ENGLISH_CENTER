type NestErrorBody = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function parseApiErrorBody(raw: string, status: number): ApiError {
  try {
    const body = JSON.parse(raw) as NestErrorBody;
    const message = body.message;

    if (Array.isArray(message)) {
      return new ApiError(status, message.join(". "));
    }

    if (typeof message === "string" && message.length > 0) {
      return new ApiError(status, message);
    }
  } catch {
  }

  if (raw.trim()) {
    return new ApiError(status, raw.trim());
  }

  return new ApiError(status, `Lỗi hệ thống (${status})`);
}

export function formatError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
}
