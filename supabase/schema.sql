-- Supabaseの「SQL Editor」に貼り付けて実行してください。
-- (プロジェクト作成後、左メニューの「SQL Editor」→「New query」)

create table if not exists app_users (
  line_user_id text primary key,
  display_name text,
  picture_url text,
  notify_enabled boolean not null default true,
  -- 通知を送る時刻のリスト。"HH:00"形式（日本時間）を複数持てる。例: ["09:00", "20:00"]
  notify_times jsonb not null default '["09:00"]'::jsonb,
  created_at timestamptz not null default now()
);

-- 既存のテーブルに対しては、このカラム追加分だけ実行すればOK
alter table app_users add column if not exists notify_times jsonb not null default '["09:00"]'::jsonb;

create table if not exists app_data (
  line_user_id text primary key references app_users(line_user_id) on delete cascade,
  tasks jsonb,
  videos jsonb,
  records jsonb,
  wishlist jsonb,
  updated_at timestamptz not null default now()
);

-- Web Push通知の購読情報（1ユーザーが複数端末を登録できるようendpointを主キーにする）
create table if not exists push_subscriptions (
  endpoint text primary key,
  line_user_id text not null references app_users(line_user_id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- サーバーはservice_role_keyでアクセスするためRLS(Row Level Security)は無効のままでOKですが、
-- 念のため明示的に有効化しておき、サーバー以外からの直接アクセスを防ぎます。
alter table app_users enable row level security;
alter table app_data enable row level security;
alter table push_subscriptions enable row level security;
-- ポリシーは意図的に作成しません（= anonキー等からは一切読み書きできない。
-- サーバー側のservice_role_keyのみアクセス可能、という状態にしています）。
