import { createClient } from "@supabase/supabase-js";

// サーバー側（API Route / Cron）専用のSupabaseクライアント。
// service_role_keyを使うためRLSを無視して読み書きできる＝クライアントには絶対に渡さないこと。
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabaseの環境変数（SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）が設定されていません"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
