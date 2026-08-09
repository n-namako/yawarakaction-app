import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRandomReminderMessage } from "@/lib/reminderMessages";
import { sendWebPush } from "@/lib/webPush";

function getCurrentJstSlot(): string {
  const now = new Date();
  const jstHour = (now.getUTCHours() + 9) % 24;
  return `${jstHour.toString().padStart(2, "0")}:00`;
}

interface WebPushError {
  statusCode?: number;
}

// Vercel Cronから毎時0分に呼ばれるエンドポイント。
// 今の日本時間の「時」がnotify_timesに含まれるユーザーの、登録済み端末全部にWeb Push通知を送る。
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const slot = getCurrentJstSlot();
  const supabase = getSupabaseAdmin();

  const { data: users, error: usersError } = await supabase
    .from("app_users")
    .select("line_user_id")
    .eq("notify_enabled", true)
    .contains("notify_times", [slot]);

  if (usersError) {
    console.error("app_usersの取得に失敗しました", usersError);
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const targetIds = (users ?? []).map((u) => u.line_user_id);
  if (targetIds.length === 0) {
    return NextResponse.json({ ok: true, slot, targeted: 0, sent: 0, failed: 0 });
  }

  const { data: subs, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("line_user_id", targetIds);

  if (subsError) {
    console.error("push_subscriptionsの取得に失敗しました", subsError);
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }

  const message = { title: "やわらかアクション（仮）", body: getRandomReminderMessage() };

  const results = await Promise.allSettled(
    (subs ?? []).map(async (sub) => {
      try {
        await sendWebPush(sub, message);
      } catch (error) {
        const statusCode = (error as WebPushError)?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // 期限切れ・削除済みの購読情報はクリーンアップ
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
        throw error;
      }
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({
    ok: true,
    slot,
    targeted: targetIds.length,
    subscriptions: results.length,
    sent,
    failed,
  });
}
