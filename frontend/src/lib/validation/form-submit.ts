import { ApiError } from "@/lib/errors/format-error";

/** Shared submit-error copy for public contact/career forms. */
export function getPublicFormSubmissionError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status >= 400 && error.status < 500) {
      return "Thông tin gửi lên chưa hợp lệ. Vui lòng kiểm tra lại các trường.";
    }
    return "Hệ thống đang bận. Vui lòng thử lại sau.";
  }

  return "Không thể kết nối tới hệ thống. Vui lòng kiểm tra mạng và thử lại.";
}
