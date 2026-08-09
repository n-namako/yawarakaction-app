import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendWebPush } from "@/lib/webPush";

// ログイン中の本人が持つ全端末に、その場でテスト通知を送る
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.lineUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("line_user_id", session.lineUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subs || subs.length === 0) {
    return NextResponse.json(
      { error: "通知が有効になっていません。まずブラウザ通知を許可してください。" },
      { status: 400 }
    );
  }

  const results = await Promise.allSettled(
    subs.map((sub) =>
      sendWebPush(sub, {
        title: "🔔 テスト通知です",
        body: "これが届いていれば、リマインド設定はバッチリです。",
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const firstFailure = results.find(
    (r): r is PromiseRejectedResult => r.status === "rejected"
  );
  if (firstFailure) {
    console.error("Web Push送信に失敗しました", firstFailure.reason);
  }

  return NextResponse.json({
    ok: sent > 0,
    sent,
    failed: results.length - sent,
    error: firstFailure
      ? firstFailure.reason instanceof Error
        ? firstFailure.reason.message
        : String(firstFailure.reason)
      : undefined,
  });
}
