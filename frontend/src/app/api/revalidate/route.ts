import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/** Tag được phép xóa cache — tránh endpoint bị lạm dụng purge tùy ý. */
const ALLOWED_TAGS = new Set(["blog"]);

/**
 * Admin gọi sau khi create/update/delete để nội dung public (ISR) cập nhật ngay
 * thay vì đợi hết revalidate 3600s.
 */
export async function POST(request: Request) {
  const tag = new URL(request.url).searchParams.get("tag") ?? "";

  if (!ALLOWED_TAGS.has(tag)) {
    return NextResponse.json(
      { revalidated: false, message: "Tag không hợp lệ" },
      { status: 400 },
    );
  }

  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}
