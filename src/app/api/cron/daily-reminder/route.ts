import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRandomReminderMessage, pushLineMessage } from "@/lib/line";

// Vercel Cronから毎日呼ばれるエンドポイント。通知ONのユーザー全員にリマインドを送る。
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: users, error } = await supabase
    .from("app_users")
    .select("line_user_id")
    .eq("notify_enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (users ?? []).map((u) => pushLineMessage(u.line_user_id, getRandomReminderMessage()))
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ ok: true, sent, failed });
}
