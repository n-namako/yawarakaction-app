import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pushLineMessage } from "@/lib/line";

// ログイン中の本人にだけ、その場でテスト通知を送る（CRON_SECRET不要）
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.lineUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await pushLineMessage(
      session.lineUserId,
      "🔔 テスト通知です！これが届いていれば、リマインド設定はバッチリです。"
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "送信に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
