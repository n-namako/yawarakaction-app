import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRandomReminderMessage, pushLineMessage } from "@/lib/line";

function getCurrentJstSlot(): string {
  const now = new Date();
  const jstHour = (now.getUTCHours() + 9) % 24;
  return `${jstHour.toString().padStart(2, "0")}:00`;
}

// Vercel Cronから毎時0分に呼ばれるエンドポイント。
// 今の日本時間の「時」を含むnotify_timesを持つユーザーにだけリマインドを送る。
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const slot = getCurrentJstSlot();

  const supabase = getSupabaseAdmin();
  const { data: users, error } = await supabase
    .from("app_users")
    .select("line_user_id")
    .eq("notify_enabled", true)
    .contains("notify_times", [slot]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (users ?? []).map((u) => pushLineMessage(u.line_user_id, getRandomReminderMessage()))
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ ok: true, slot, targeted: results.length, sent, failed });
}
