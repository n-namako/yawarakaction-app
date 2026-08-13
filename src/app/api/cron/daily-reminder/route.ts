import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRandomReminderMessage } from "@/lib/reminderMessages";
import { sendWebPush } from "@/lib/webPush";

interface WebPushError {
  statusCode?: number;
}

interface AppUserRow {
  line_user_id: string;
  notify_times: string[] | null;
  last_notified_at: string | null;
}

// 「今ちょうどこの時刻か」ではなく、「前回通知してから今までの間に来るべきだった時間帯」を
// 探す。GitHub Actionsのcronが多少遅延・スキップしても、通知の取りこぼしを防ぐため。
// ただし長期間止まっていた場合に一気に古い通知が飛ばないよう、さかのぼる範囲は12時間までに制限している
const LOOKBACK_MS = 12 * 60 * 60 * 1000;

function hasDueSlot(notifyTimes: string[] | null, lastNotifiedAt: string | null, now: Date): boolean {
  if (!notifyTimes || notifyTimes.length === 0) return false;

  const lookbackLimit = now.getTime() - LOOKBACK_MS;
  const lastNotifiedMs = lastNotifiedAt ? new Date(lastNotifiedAt).getTime() : NaN;
  const sinceMs = Number.isFinite(lastNotifiedMs) ? Math.max(lastNotifiedMs, lookbackLimit) : lookbackLimit;

  // 「日本時間の今日」の各notify_timesの実時刻(UTC ms)を計算する
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  return notifyTimes.some((slot) => {
    const hour = Number(slot.split(":")[0]);
    if (!Number.isFinite(hour)) return false;
    const slotJstShifted = Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate(), hour, 0, 0);
    const slotUtcMs = slotJstShifted - 9 * 60 * 60 * 1000;
    return slotUtcMs > sinceMs && slotUtcMs <= now.getTime();
  });
}

// GitHub Actionsから毎時（0分より少しずらしたタイミングで）呼ばれるエンドポイント。
// 通知を有効にしていて、かつ「前回通知してから今までの間に来るべきだった時間帯」があるユーザー全員に、
// 登録済み端末へWeb Push通知を送る。
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const supabase = getSupabaseAdmin();

  const { data: users, error: usersError } = await supabase
    .from("app_users")
    .select("line_user_id, notify_times, last_notified_at")
    .eq("notify_enabled", true);

  if (usersError) {
    console.error("app_usersの取得に失敗しました", usersError);
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const targetIds = ((users ?? []) as AppUserRow[])
    .filter((u) => hasDueSlot(u.notify_times, u.last_notified_at, now))
    .map((u) => u.line_user_id);

  if (targetIds.length === 0) {
    return NextResponse.json({ ok: true, checkedAt: now.toISOString(), targeted: 0, sent: 0, failed: 0 });
  }

  const { data: subs, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, line_user_id")
    .in("line_user_id", targetIds);

  if (subsError) {
    console.error("push_subscriptionsの取得に失敗しました", subsError);
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }

  const message = { title: "やわらかアクション v1.0", body: getRandomReminderMessage() };

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

  // 次回のキャッチアップ判定が正しく進むよう、今回通知対象になったユーザーの「最終通知時刻」を更新
  await supabase.from("app_users").update({ last_notified_at: now.toISOString() }).in("line_user_id", targetIds);

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({
    ok: true,
    checkedAt: now.toISOString(),
    targeted: targetIds.length,
    subscriptions: results.length,
    sent,
    failed,
  });
}
