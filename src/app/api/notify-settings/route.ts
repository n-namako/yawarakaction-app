import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { DEFAULT_NOTIFY_TIMES, sanitizeNotifyTimes } from "@/lib/notifyTimes";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.lineUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("notify_enabled, notify_times")
    .eq("line_user_id", session.lineUserId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    notifyEnabled: data?.notify_enabled ?? true,
    notifyTimes: sanitizeNotifyTimes(data?.notify_times ?? DEFAULT_NOTIFY_TIMES),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.lineUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { notifyEnabled: boolean; notifyTimes: unknown };
  const notifyTimes = sanitizeNotifyTimes(body.notifyTimes);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("app_users").upsert(
    {
      line_user_id: session.lineUserId,
      display_name: session.user?.name ?? null,
      picture_url: session.user?.image ?? null,
      notify_enabled: body.notifyEnabled,
      notify_times: notifyTimes,
    },
    { onConflict: "line_user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, notifyTimes });
}
