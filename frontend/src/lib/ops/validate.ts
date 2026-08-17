import { containsHtmlCharacters, getEmailValidationError, getNameValidationError } from "@/lib/validation/person";
import { getPhoneValidationError } from "@/lib/validation/phone";

const TIME_PATTERN = /^\d{2}:\d{2}$/;
const PERIOD_PATTERN = /^\d{4}-\d{2}$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type StudentFormInput = {
  fullName: string;
  phone: string;
  email: string;
};

export type ClassFormInput = {
  name: string;
  startTime: string | null;
  endTime: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
  capacity: number | null;
  room?: string | null;
};

export type InvoiceFormInput = {
  studentId: string;
  period: string;
  amount: string;
  dueDate: string;
  note: string;
};

function optionalPhoneError(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const error = getPhoneValidationError(trimmed);
  if (!error) return undefined;
  return error.replace("Số điện thoại", label);
}

export function validateStudentForm(form: StudentFormInput) {
  const errors: Partial<Record<keyof StudentFormInput, string>> = {};
  const nameError = getNameValidationError(form.fullName, { min: 2, max: 100 });
  if (nameError) errors.fullName = nameError;

  const phoneError = optionalPhoneError(form.phone, "Số điện thoại");
  if (phoneError) errors.phone = phoneError;

  const emailError = getEmailValidationError(form.email);
  if (emailError) errors.email = emailError;

  return errors;
}

export function validateClassForm(form: ClassFormInput) {
  const errors: Partial<
    Record<"name" | "startTime" | "endTime" | "startsOn" | "endsOn" | "capacity" | "room", string>
  > = {};
  const name = form.name.trim();
  if (!name) {
    errors.name = "Tên lớp không được để trống.";
  } else if (containsHtmlCharacters(name)) {
    errors.name = "Tên lớp không được chứa thẻ HTML.";
  } else if (name.length < 2) {
    errors.name = "Tên lớp cần ít nhất 2 ký tự.";
  } else if (name.length > 100) {
    errors.name = "Tên lớp không được vượt quá 100 ký tự.";
  }

  const start = form.startTime?.trim() || "";
  const end = form.endTime?.trim() || "";
  if (start && !TIME_PATTERN.test(start)) {
    errors.startTime = "Giờ bắt đầu phải có định dạng HH:mm.";
  }
  if (end && !TIME_PATTERN.test(end)) {
    errors.endTime = "Giờ kết thúc phải có định dạng HH:mm.";
  }
  if (start && end && TIME_PATTERN.test(start) && TIME_PATTERN.test(end) && start >= end) {
    errors.endTime = "Giờ kết thúc phải sau giờ bắt đầu.";
  }

  const startsOn = form.startsOn?.trim() || "";
  const endsOn = form.endsOn?.trim() || "";
  if (startsOn && !DATE_ONLY_PATTERN.test(startsOn)) {
    errors.startsOn = "Ngày bắt đầu khóa phải có định dạng YYYY-MM-DD.";
  }
  if (endsOn && !DATE_ONLY_PATTERN.test(endsOn)) {
    errors.endsOn = "Ngày kết thúc khóa phải có định dạng YYYY-MM-DD.";
  }
  if (
    startsOn &&
    endsOn &&
    DATE_ONLY_PATTERN.test(startsOn) &&
    DATE_ONLY_PATTERN.test(endsOn) &&
    endsOn < startsOn
  ) {
    errors.endsOn = "Ngày kết thúc khóa phải sau hoặc bằng ngày bắt đầu.";
  }

  if (form.capacity != null) {
    if (!Number.isInteger(form.capacity)) {
      errors.capacity = "Sĩ số phải là số nguyên.";
    } else if (form.capacity < 1) {
      errors.capacity = "Sĩ số tối thiểu là 1.";
    } else if (form.capacity > 200) {
      errors.capacity = "Sĩ số tối đa là 200.";
    }
  }

  const room = form.room?.trim() ?? "";
  if (room.length > 50) {
    errors.room = "Phòng học không được vượt quá 50 ký tự.";
  } else if (containsHtmlCharacters(room)) {
    errors.room = "Phòng học không được chứa thẻ HTML.";
  }

  return errors;
}

export function validateInvoiceForm(form: InvoiceFormInput) {
  const errors: Partial<Record<keyof InvoiceFormInput, string>> = {};
  if (!form.studentId.trim()) {
    errors.studentId = "Vui lòng chọn học viên.";
  }
  if (!PERIOD_PATTERN.test(form.period.trim())) {
    errors.period = "Kỳ học phí phải có định dạng YYYY-MM.";
  }
  const amount = Number(form.amount);
  if (!form.amount.trim() || Number.isNaN(amount)) {
    errors.amount = "Vui lòng nhập số tiền.";
  } else if (!Number.isInteger(amount)) {
    errors.amount = "Số tiền phải là số nguyên.";
  } else if (amount < 0) {
    errors.amount = "Số tiền không được âm.";
  } else if (amount > 100_000_000) {
    errors.amount = "Số tiền không hợp lệ.";
  }
  if (!DATE_ONLY_PATTERN.test(form.dueDate.trim())) {
    errors.dueDate = "Hạn đóng phải có định dạng YYYY-MM-DD.";
  }
  const note = form.note.trim();
  if (containsHtmlCharacters(note)) {
    errors.note = "Ghi chú không được chứa thẻ HTML.";
  } else if (note.length > 500) {
    errors.note = "Ghi chú không được vượt quá 500 ký tự.";
  }
  return errors;
}
