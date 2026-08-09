import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.lineUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("notify_enabled")
    .eq("line_user_id", session.lineUserId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifyEnabled: data?.notify_enabled ?? true });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.lineUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { notifyEnabled } = (await request.json()) as { notifyEnabled: boolean };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("app_users").upsert(
    {
      line_user_id: session.lineUserId,
      display_name: session.user?.name ?? null,
      picture_url: session.user?.image ?? null,
      notify_enabled: notifyEnabled,
    },
    { onConflict: "line_user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
