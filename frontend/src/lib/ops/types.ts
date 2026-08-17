export type ListMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type StudentStatus = "STUDYING" | "PAUSED" | "FINISHED";
export type ClassStatus = "OPEN" | "CLOSED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export type InvoiceStatus = "UNPAID" | "PENDING" | "PAID";

export type LinkedParent = {
  parentUserId: string;
  parent: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
};

export type Student = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  parentName: string | null;
  parentPhone: string | null;
  status: StudentStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  classCount?: number;
  parents?: LinkedParent[];
  enrollments?: Array<{
    id: string;
    class: { id: string; name: string; status: ClassStatus };
  }>;
};

export type StudentPayload = {
  fullName: string;
  phone?: string | null;
  email?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  status?: StudentStatus;
  note?: string | null;
  parentUserIds?: string[];
};

export type ClassGroup = {
  id: string;
  name: string;
  courseId: string | null;
  level: string | null;
  teacherId: string | null;
  scheduleDays: number[];
  startTime: string | null;
  endTime: string | null;
  room: string | null;
  capacity: number | null;
  status: ClassStatus;
  createdAt: string;
  updatedAt: string;
  studentCount: number;
  teacher: { id: string; fullName: string; email: string } | null;
  course: { id: string; title: string; slug: string } | null;
  enrollments?: Array<{
    id: string;
    studentId: string;
    student: {
      id: string;
      fullName: string;
      phone: string | null;
      email: string | null;
      status: StudentStatus;
    };
  }>;
};

export type ClassPayload = {
  name: string;
  courseId?: string | null;
  level?: string | null;
  teacherId?: string | null;
  scheduleDays?: number[];
  startTime?: string | null;
  endTime?: string | null;
  room?: string | null;
  capacity?: number | null;
  status?: ClassStatus;
};

export type AttendanceRate = {
  total: number;
  present: number;
  late: number;
  absent: number;
  percent: number;
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  status: AttendanceStatus;
  note: string | null;
  markedAt?: string;
  student?: { id: string; fullName: string };
  date?: string;
  class?: { id: string; name: string };
};

export type ClassSession = {
  id: string;
  classId: string;
  date: string;
  note: string | null;
  attendances?: AttendanceRecord[];
};

export type TuitionInvoice = {
  id: string;
  studentId: string;
  period: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; fullName: string; phone?: string | null; email?: string | null };
  overdue?: boolean;
};

export type BankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  note: string;
};

export type InvoicePayload = {
  studentId: string;
  period: string;
  amount: number;
  dueDate: string;
  note?: string | null;
};
