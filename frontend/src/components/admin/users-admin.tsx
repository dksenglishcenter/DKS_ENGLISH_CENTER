"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

import { useAdminUser } from "@/components/admin/admin-shell";
import {
  BulkActionsBar,
  SelectAllHeaderCell,
  SelectRowCell,
} from "@/components/admin/bulk-actions-bar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { UsersForm } from "@/components/admin/users/users-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAdminDateTime } from "@/lib/admin/format";
import { scrollToElement } from "@/lib/admin/scroll";
import { formatError } from "@/lib/errors/format-error";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { deleteUser, listUsers } from "@/lib/users/api";
import type { ManagedUser, UserRole, UsersMeta } from "@/lib/users/types";

const PAGE_SIZE = 10;

const FILTER_CONTROL =
  "h-11 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary";

export function UsersAdmin() {
  const currentUser = useAdminUser();
  const formSectionRef = useRef<HTMLDivElement>(null);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [meta, setMeta] = useState<UsersMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | UserRole>("");
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [formUser, setFormUser] = useState<ManagedUser | null | undefined>(undefined);
  const [formSession, setFormSession] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError(null);

    listUsers({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      role: roleFilter || undefined,
      signal: controller.signal,
    })
      .then((response) => {
        setUsers(response.data);
        setMeta(response.meta);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setListError(formatError(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, reloadKey, roleFilter, search]);

  useEffect(() => {
    if (formUser !== undefined) scrollToElement(formSectionRef.current);
  }, [formUser, formSession]);

  const bulk = useBulkSelection(
    users.filter((user) => user.id !== currentUser.id).map((user) => user.id),
  );

  async function handleBulkDelete() {
    setListError(null);
    try {
      await bulk.runOnSelected(deleteUser);
      reload();
    } catch (error) {
      setListError(formatError(error));
      bulk.closeConfirm();
    }
  }

  function reload() {
    setReloadKey((current) => current + 1);
  }

  function openForm(user: ManagedUser | null) {
    setFormUser(user);
    setFormSession((current) => current + 1);
    setNotice(null);
  }

  function closeForm() {
    setFormUser(undefined);
  }

  function handleSaved(message: string) {
    setNotice(message);
    closeForm();
    if (page !== 1) setPage(1);
    else reload();
  }

  function toggleCreateForm() {
    if (formUser !== undefined && formUser === null) {
      closeForm();
      return;
    }
    openForm(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);
    setNotice(null);

    try {
      const response = await deleteUser(deleteTarget.id);
      setNotice(response.message);
      setDeleteTarget(null);
      if (formUser?.id === deleteTarget.id) closeForm();
      if (users.length === 1 && page > 1) setPage((current) => current - 1);
      else reload();
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setDeleting(false);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  const creating = formUser !== undefined && formUser === null;

  return (
    <section className="space-y-6" aria-labelledby="users-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="users-title"
            className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]"
          >
            Người dùng
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tài khoản USER và ADMIN của hệ thống.
          </p>
        </div>
        <Button
          type="button"
          variant={creating ? "outline" : "primary"}
          onClick={toggleCreateForm}
        >
          <Plus className="size-4" aria-hidden="true" />
          {creating ? "Đóng form thêm" : "Tạo tài khoản"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {notice ? (
        <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {notice}
        </p>
      ) : null}

      {formUser !== undefined ? (
        <div ref={formSectionRef}>
          <UsersForm
            key={`${formUser?.id ?? "create"}-${formSession}`}
            user={formUser}
            currentUserId={currentUser.id}
            onCancel={closeForm}
            onSaved={handleSaved}
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <form className="flex flex-1 gap-2" role="search" onSubmit={submitSearch}>
            <Input
              type="search"
              className="h-11 py-2"
              value={searchInput}
              maxLength={100}
              placeholder="Tìm tên, email, số điện thoại..."
              onChange={(event) => setSearchInput(event.target.value)}
            />
            {searchInput || search ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11"
                aria-label="Xóa tìm kiếm"
                onClick={clearSearch}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
            <Button type="submit" size="sm" className="h-11 px-5">
              <Search className="size-4" aria-hidden="true" />
              Tìm
            </Button>
          </form>

          <select
            aria-label="Lọc theo quyền"
            className={FILTER_CONTROL}
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as "" | UserRole);
              setPage(1);
            }}
          >
            <option value="">Tất cả quyền</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11"
            disabled={loading}
            onClick={reload}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Tải lại
          </Button>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Không tìm thấy tài khoản phù hợp.
          </p>
        ) : (
          <>
          <BulkActionsBar
            count={bulk.count}
            busy={bulk.busy}
            onDelete={bulk.openConfirm}
            onClear={bulk.clear}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-muted text-muted-foreground">
                <tr>
                  <SelectAllHeaderCell
                    allSelected={bulk.allSelected}
                    onToggle={bulk.toggleAll}
                  />
                  <th className="px-4 py-3 font-semibold">Người dùng</th>
                  <th className="px-4 py-3 font-semibold">Điện thoại</th>
                  <th className="px-4 py-3 font-semibold">Quyền</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  return (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <SelectRowCell
                        checked={bulk.isSelected(user.id)}
                        onToggle={() => bulk.toggle(user.id)}
                        label={user.fullName}
                        disabled={isSelf}
                        disabledTitle="Không thể tự xóa tài khoản"
                      />
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {user.fullName}
                          {isSelf ? " (Bạn)" : ""}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatAdminDateTime(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-[92px] rounded-lg"
                            onClick={() => openForm(user)}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            Sửa
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="w-[92px] rounded-lg"
                            disabled={isSelf}
                            title={isSelf ? "Không thể tự xóa tài khoản" : undefined}
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 border-t border-border p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Trang trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {meta.currentPage}/{meta.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || page >= meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Trang sau
            </Button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa tài khoản?"
        description={
          deleteTarget
            ? `Tài khoản ${deleteTarget.fullName} (${deleteTarget.email}) sẽ bị xóa vĩnh viễn.`
            : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />

      <ConfirmDialog
        open={bulk.confirmOpen}
        title="Xóa các tài khoản đã chọn?"
        description={`Bạn chắc muốn xóa ${bulk.count} tài khoản đã chọn? Thao tác này không hoàn tác được.`}
        busy={bulk.busy}
        onCancel={() => {
          if (!bulk.busy) bulk.closeConfirm();
        }}
        onConfirm={() => void handleBulkDelete()}
      />
    </section>
  );
}
