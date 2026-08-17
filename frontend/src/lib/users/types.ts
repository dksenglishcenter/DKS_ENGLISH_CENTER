export type UserRole = "USER" | "ADMIN" | "TEACHER" | "PARENT";

export type ManagedUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type UsersMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type UserPayload = {
  fullName: string;
  email: string;
  phone?: string | null;
  password?: string;
  role: UserRole;
};

export type CreateUserPayload = UserPayload & { password: string };

export type ListUsersOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  signal?: AbortSignal;
};
