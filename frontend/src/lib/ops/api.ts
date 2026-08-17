import { apiFetch } from "@/lib/api/client";
import type {
  AttendanceRate,
  AttendanceRecord,
  AttendanceStatus,
  BankDetails,
  ClassGroup,
  ClassPayload,
  ClassSession,
  ClassStatus,
  InvoicePayload,
  InvoiceStatus,
  ListMeta,
  Student,
  StudentPayload,
  StudentStatus,
  TuitionInvoice,
} from "./types";

export function listStudents(options: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: StudentStatus | "";
  signal?: AbortSignal;
} = {}) {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 20),
  });
  if (options.search) query.set("search", options.search);
  if (options.status) query.set("status", options.status);
  return apiFetch<{ data: Student[]; meta: ListMeta }>(`/students?${query}`, {
    method: "GET",
    cache: "no-store",
    signal: options.signal,
  });
}

export function getStudent(id: string) {
  return apiFetch<{ data: Student }>(`/students/${id}`, { method: "GET" });
}

export function createStudent(payload: StudentPayload) {
  return apiFetch<{ message: string; data: Student }>("/students", {
    method: "POST",
    json: payload,
  });
}

export function updateStudent(id: string, payload: StudentPayload) {
  return apiFetch<{ message: string; data: Student }>(`/students/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export function deleteStudent(id: string) {
  return apiFetch<{ message: string; data: Student }>(`/students/${id}`, {
    method: "DELETE",
  });
}

export function listClasses(options: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ClassStatus | "";
  signal?: AbortSignal;
} = {}) {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 20),
  });
  if (options.search) query.set("search", options.search);
  if (options.status) query.set("status", options.status);
  return apiFetch<{ data: ClassGroup[]; meta: ListMeta }>(`/classes?${query}`, {
    method: "GET",
    cache: "no-store",
    signal: options.signal,
  });
}

export function listMyClasses(signal?: AbortSignal) {
  return apiFetch<{ data: ClassGroup[] }>("/classes/mine", {
    method: "GET",
    cache: "no-store",
    signal,
  });
}

export function getClass(id: string) {
  return apiFetch<{ data: ClassGroup }>(`/classes/${id}`, { method: "GET" });
}

export function createClass(payload: ClassPayload) {
  return apiFetch<{ message: string; data: ClassGroup }>("/classes", {
    method: "POST",
    json: payload,
  });
}

export function updateClass(id: string, payload: Partial<ClassPayload>) {
  return apiFetch<{ message: string; data: ClassGroup }>(`/classes/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export function deleteClass(id: string) {
  return apiFetch<{ message: string }>(`/classes/${id}`, { method: "DELETE" });
}

export function enrollStudent(classId: string, studentId: string) {
  return apiFetch<{ message?: string; data: ClassGroup }>(
    `/classes/${classId}/students`,
    { method: "POST", json: { studentId } },
  );
}

export function unenrollStudent(classId: string, studentId: string) {
  return apiFetch<{ message: string }>(
    `/classes/${classId}/students/${studentId}`,
    { method: "DELETE" },
  );
}

export function openSession(classId: string, date: string) {
  return apiFetch<{ message: string; data: ClassSession }>(
    `/classes/${classId}/sessions`,
    { method: "POST", json: { date } },
  );
}

export function saveAttendance(
  sessionId: string,
  records: Array<{ studentId: string; status: AttendanceStatus }>,
) {
  return apiFetch<{ message: string; data: ClassSession }>(
    `/sessions/${sessionId}/attendance`,
    { method: "PUT", json: { records } },
  );
}

export function getClassAttendance(
  classId: string,
  options: { from?: string; to?: string } = {},
) {
  const query = new URLSearchParams();
  if (options.from) query.set("from", options.from);
  if (options.to) query.set("to", options.to);
  const suffix = query.toString() ? `?${query}` : "";
  return apiFetch<{
    data: {
      sessions: ClassSession[];
      rates: Array<{ studentId: string; fullName: string; rate: AttendanceRate }>;
    };
  }>(`/classes/${classId}/attendance${suffix}`, { method: "GET" });
}

export function listInvoices(options: {
  page?: number;
  pageSize?: number;
  status?: InvoiceStatus | "";
  studentId?: string;
  signal?: AbortSignal;
} = {}) {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 20),
  });
  if (options.status) query.set("status", options.status);
  if (options.studentId) query.set("studentId", options.studentId);
  return apiFetch<{ data: TuitionInvoice[]; meta: ListMeta }>(
    `/tuition?${query}`,
    { method: "GET", cache: "no-store", signal: options.signal },
  );
}

export function createInvoice(payload: InvoicePayload) {
  return apiFetch<{ message: string; data: TuitionInvoice }>("/tuition", {
    method: "POST",
    json: payload,
  });
}

export function markInvoicePaid(id: string) {
  return apiFetch<{ message: string; data: TuitionInvoice }>(
    `/tuition/${id}/mark-paid`,
    { method: "POST" },
  );
}

export function deleteInvoice(id: string) {
  return apiFetch<{ message: string }>(`/tuition/${id}`, { method: "DELETE" });
}

export function listParentChildren(signal?: AbortSignal) {
  return apiFetch<{ data: Student[] }>("/parent/children", {
    method: "GET",
    cache: "no-store",
    signal,
  });
}

export function getParentChildAttendance(studentId: string) {
  return apiFetch<{
    data: {
      student: { id: string; fullName: string; status: StudentStatus };
      records: AttendanceRecord[];
      rate: AttendanceRate;
    };
  }>(`/parent/children/${studentId}/attendance`, { method: "GET" });
}

export function listParentInvoices() {
  return apiFetch<{ data: TuitionInvoice[]; bank: BankDetails }>(
    "/parent/invoices",
    { method: "GET", cache: "no-store" },
  );
}

export function listParentReminders() {
  return apiFetch<{ data: TuitionInvoice[] }>("/parent/reminders", {
    method: "GET",
    cache: "no-store",
  });
}

export function reportTransfer(invoiceId: string) {
  return apiFetch<{ message: string; data: TuitionInvoice }>(
    `/parent/invoices/${invoiceId}/report-transfer`,
    { method: "POST" },
  );
}
