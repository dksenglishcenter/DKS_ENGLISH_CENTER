"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { BlogForm } from "@/components/admin/blog/blog-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { RowActions } from "./row-actions";
import { formatAdminDate } from "@/lib/admin/format";
import { deleteBlogPost, listBlogPosts } from "@/lib/blog/api";
import type { BlogPost } from "@/lib/blog/types";
import { formatError } from "@/lib/errors/format-error";

export function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [formPost, setFormPost] = useState<BlogPost | null | undefined>(undefined);
  const [formSession, setFormSession] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await listBlogPosts({ publishedOnly: false });
      setPosts(response.blogPosts);
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const nextSortOrder =
    posts.reduce((max, post) => Math.max(max, post.sortOrder), -1) + 1;

  function openForm(post: BlogPost | null) {
    setFormPost(post);
    setFormSession((current) => current + 1);
    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function closeForm() {
    setFormPost(undefined);
  }

  function handleSaved(_successMessage: string) {
    closeForm();
    void load();
  }

  function toggleCreateForm() {
    if (formPost !== undefined && formPost === null) {
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
      await deleteBlogPost(deleteTarget.id);
      if (formPost?.id === deleteTarget.id) closeForm();
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setListError(formatError(error));
    } finally {
      setDeleting(false);
    }
  };

  const creating = formPost !== undefined && formPost === null;

  return (
    <section className="space-y-6" aria-labelledby="blog-admin-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="blog-admin-title"
            className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]"
          >
            Blog
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý bài viết blog: intro, sections, ảnh và link.
          </p>
        </div>
        <Button
          type="button"
          variant={creating ? "outline" : "primary"}
          onClick={toggleCreateForm}
        >
          <Plus className="size-4" aria-hidden="true" />
          {creating ? "Đóng form thêm" : "Thêm bài viết"}
        </Button>
      </div>

      {listError ? <p className="text-sm text-red-600">{listError}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-[800px] text-left text-sm lg:min-w-full">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              <th className="w-60 min-w-60 px-4 py-3 font-semibold lg:w-auto lg:min-w-0">Bài viết</th>
              <th className="w-44 min-w-44 px-4 py-3 font-semibold lg:w-auto lg:min-w-0">Chuyên mục</th>
              <th className="px-4 py-3 font-semibold">Ngày</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0">
                <td className="w-60 min-w-60 px-4 py-3 lg:w-auto lg:min-w-0">
                  <div
                    className="line-clamp-2 font-semibold leading-snug text-foreground lg:line-clamp-none"
                    title={post.title}
                  >
                    {post.title}
                  </div>
                  <div
                    className="mt-0.5 line-clamp-2 break-all text-xs leading-snug text-muted-foreground lg:line-clamp-none lg:break-normal"
                    title={`/${post.slug}`}
                  >
                    /{post.slug}
                  </div>
                </td>
                <td className="w-44 min-w-44 px-4 py-3 lg:w-auto lg:min-w-0">
                  <div className="line-clamp-2 leading-snug lg:line-clamp-none" title={post.category}>
                    {post.category}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 lg:whitespace-normal">
                  {formatAdminDate(`${post.publishedAt}T00:00:00Z`)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 lg:whitespace-normal">
                  {post.isPublished ? "Có" : "Ẩn"}
                  {post.featured ? " · Hot" : ""}
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    onEdit={() => openForm(post)}
                    onDelete={() => setDeleteTarget(post)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Chưa có bài viết.
          </p>
        ) : null}
      </div>

      {formPost !== undefined ? (
        <div ref={formSectionRef}>
          <BlogForm
            key={`${formPost?.id ?? "create"}-${formSession}`}
            post={formPost}
            nextSortOrder={nextSortOrder}
            onCancel={closeForm}
            onSaved={handleSaved}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa bài viết?"
        description={
          deleteTarget ? `Bài “${deleteTarget.title}” sẽ bị xóa vĩnh viễn.` : ""
        }
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
