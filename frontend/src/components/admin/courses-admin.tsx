"use client";

import { useEffect, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CourseForm } from "@/components/admin/courses/course-form";
import { Button } from "@/components/ui/button";
import { RowActions } from "./row-actions";
import { deleteCourse, listCourses } from "@/lib/courses/api";
import type { Course } from "@/lib/courses/types";
import { formatError } from "@/lib/errors/format-error";

export function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [formCourse, setFormCourse] = useState<Course | null | undefined>(undefined);
  const [formSession, setFormSession] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await listCourses({ publishedOnly: false });
      setCourses(response.courses);
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  function openForm(course: Course | null) {
    setFormCourse(course);
    setFormSession((current) => current + 1);
    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function closeForm() {
    setFormCourse(undefined);
  }

  function handleSaved(_successMessage: string) {
    closeForm();
    void load();
  }

  function toggleCreateForm() {
    if (formCourse !== undefined && formCourse === null) {
      closeForm();
      return;
    }
    openForm(null);
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError(null);
    try {
      await deleteCourse(deleteTarget.id);
      if (formCourse?.id === deleteTarget.id) closeForm();
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setListError(formatError(err));
    } finally {
      setDeleting(false);
    }
  };

  const creating = formCourse !== undefined && formCourse === null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
          Khóa học
        </h2>
        <Button
          type="button"
          variant={creating ? "outline" : "primary"}
          onClick={toggleCreateForm}
        >
          {creating ? "Đóng form thêm" : "Thêm khóa học"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Khóa</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">{course.title}</div>
                  <div className="text-xs text-muted-foreground">{course.slug}</div>
                </td>
                <td className="px-4 py-3">{course.category}</td>
                <td className="px-4 py-3">{course.featured ? "Có" : "Không"}</td>
                <td className="px-4 py-3">{course.isPublished ? "Có" : "Ẩn"}</td>
                <td className="px-4 py-3">{course.sortOrder}</td>
                <td className="px-4 py-3">
                  <RowActions
                    onEdit={() => openForm(course)}
                    onDelete={() => setDeleteTarget(course)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formCourse !== undefined ? (
        <div ref={formSectionRef}>
          <CourseForm
            key={`${formCourse?.id ?? "create"}-${formSession}`}
            course={formCourse}
            existingCourses={courses}
            onCancel={closeForm}
            onSaved={handleSaved}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa khóa học?"
        description={
          deleteTarget
            ? `Bạn chắc muốn xóa khóa “${deleteTarget.title}”?`
            : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
