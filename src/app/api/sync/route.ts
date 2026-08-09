import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

interface SyncPayload {
  tasks?: unknown;
  videos?: unknown;
  records?: unknown;
  wishlist?: unknown;
}

// ログイン中のユーザーのクラウドデータを取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.lineUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_data")
    .select("tasks, videos, records, wishlist, updated_at")
    .eq("line_user_id", session.lineUserId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? null });
}

// ローカルの最新データをクラウドに保存（ユーザー情報も一緒にupsert）
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.lineUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SyncPayload;

  const supabase = getSupabaseAdmin();

  const { error: userError } = await supabase.from("app_users").upsert(
    {
      line_user_id: session.lineUserId,
      display_name: session.user?.name ?? null,
      picture_url: session.user?.image ?? null,
    },
    { onConflict: "line_user_id", ignoreDuplicates: false }
  );
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const { error: dataError } = await supabase.from("app_data").upsert(
    {
      line_user_id: session.lineUserId,
      tasks: body.tasks ?? null,
      videos: body.videos ?? null,
      records: body.records ?? null,
      wishlist: body.wishlist ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "line_user_id" }
  );
  if (dataError) {
    return NextResponse.json({ error: dataError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
