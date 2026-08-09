# 引き継ぎ資料：やわらかアクション（仮）

## 1. プロジェクト概要と目指す世界観

**「やわらかアクション」**は、自己肯定感が上がることを目的にした個人用Webアプリです。

- 「今日も、ここまでのあなたで十分えらい」という前提に立ち、ユーザーを追い詰めない・急かさない
- 数分でできる小さなアクション（部屋の掃除、深呼吸、いぬと遊ぶ等）や動画エクササイズを、気軽に「ひとつだけ」提案する
- できたら紙吹雪と褒め言葉で全力で褒める（キリのいい回数ではさらに豪華な演出）
- 「やらなきゃいけないこと」ではなく「やりたいこと」を無理なく積み重ねられる場所にする
- 全体のトーン：温かい、優しい、開くだけで少しホッとする。パステルカラー、丸みのあるフォント、優しいアニメーション

**開発の進め方**：この後の開発も、厳密な仕様書ではなく**自然言語でAIに雰囲気・意図を伝えながら一緒に作っていく「バイブコーディング」**で進めます。細かい実装方針はAI側の裁量に委ね、ユーザーは「こうしたい」という要望と使用感のフィードバックを伝える、という進め方を継続してください。

---

## 2. 技術スタックと表記ルール

- **Next.js**（App Router, Turbopack）／ **React** ／ **TypeScript** ／ **Tailwind CSS**
- **Vercel**（ホスティング・デプロイ）
- **Supabase**（Postgres データベース。ログイン中ユーザーのデータ永続化に使用）
- **NextAuth**（v4）＋ **LINEログイン**（データ同期のためのアカウント識別。LINE Messaging APIは現在使用していない）
- **Web Push API**（Service Worker + VAPID鍵）— 通知はLINEではなく、ブラウザ標準のプッシュ通知を使用
- **GitHub**（ソース管理）／ **GitHub Actions**（Cronの代替。Vercel Hobbyプランは1日1回までしかCronを実行できないため、毎時トリガーはGitHub Actionsから行っている）
- **GitHub CLI (`gh`)** ／ **Vercel CLI (`vercel`)** をローカルから操作

---

## 3. 実装完了済みの機能

### アプリ本体（localStorage版として先行実装）
- アクション提案機能（タイマー・チャイム音付き）
- 動画エクササイズ機能（時間で選ぶ／体の部位で選ぶ、の2軸）
- 全力で褒める機能（紙吹雪＋褒め言葉、キリのいい回数で特別演出）
- 記録機能（きろくタイムライン、削除は確認モーダル付き）
- もっとできちゃう？（長期のやりたいことリスト）

### デプロイ・インフラ
- GitHubリポジトリ作成・push: https://github.com/n-namako/yawarakaction-app
- Vercelへのデプロイ完了、本番URL: **https://yawarakaction-app.vercel.app**
- GitHub↔Vercel連携（pushで自動デプロイ）

### LINEログイン & データ同期
- LINE Developers Consoleで「LINEログイン」チャンネルを作成・公開設定済み
- NextAuthでLINEログインを実装、コールバックURL設定済み
- ログイン中はSupabaseへ自動でクラウド同期（キャッシュ削除しても消えない）
- スマホ・PC両方でログイン動作確認済み

### Web Push通知
- VAPID鍵ペア生成・設定済み
- Service Worker（`public/sw.js`）実装済み
- 「この端末で通知を受け取る」→ ブラウザ通知許可 → 購読保存の一連の流れが実装済み
- **本人がアプリ内の「テスト通知を送る」ボタンで通知を受信できることを確認済み**
- 通知時間帯（07/09/12/18/21時から複数選択可）のUIも実装済み

### Supabaseテーブル
- `app_users`（ユーザー情報・通知設定）
- `app_data`（タスク/動画/記録/やりたいことリストのJSON同期データ）
- `push_subscriptions`（Web Push購読情報）
- 上記3テーブルとも `service_role` へのGRANTを実行済み（"permission denied"エラーは解消済み）

---

## 4. 現在の作業状況とNext Step

**既知の不具合はすべて解消済みです。** 直近のセッションで以下を修正し、GitHub Actions経由の毎時リマインドが `200` 成功することを確認済みです：
1. `app_users.notify_times` カラムが未作成だった → `alter table` で追加
2. Supabase `.contains()` にJS配列をそのまま渡すと、jsonbカラムに対して不正な形式（Postgres配列リテラル）でシリアライズされてしまっていた → `JSON.stringify()` で明示的にJSON文字列として渡すよう修正

### 現時点でNext Stepと呼べる具体タスクはなし
一通りの基盤（デプロイ・LINEログイン・クラウド同期・Web Push通知・毎時リマインド）が完成し、動作確認も取れている状態です。次のチャットは、新機能追加やUI改善など、ユーザーからの新しい要望を聞くところから始めてください。

ただし、**まだ実機での「決まった時間に本当に通知が届くか」の自然な実地確認は済んでいません**（GitHub Actionsからの手動トリガーでの成功確認のみ）。次にユーザーと話す際、「時間になったらちゃんと通知来てる？」と一声聞いてみるとよいです。

### 運用上の既知の癖（ハマりポイント）
- **`vercel --prod` や `vercel redeploy` を実行すると、なぜか毎回 `jikoteikan-app.vercel.app`（旧プロジェクト名のドメイン）にエイリアスされてしまう。** デプロイのたびに以下で本来のドメインに貼り直すこと：
  ```bash
  npx vercel alias set <新しいデプロイのURL> yawarakaction-app.vercel.app
  ```
- Vercel Hobbyプランは **1日1回しかCronを実行できない**ため、毎時実行が必要な処理はVercel Cronではなく `.github/workflows/hourly-reminder.yml`（GitHub Actions）側で行っている。`vercel.json` にcronは書かないこと。
- 環境変数（LINE_CHANNEL_ID/SECRET, SUPABASE_URL/SERVICE_ROLE_KEY, NEXTAUTH_SECRET/URL, CRON_SECRET, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY）はVercelダッシュボードに設定済み。値そのものはAIには一切共有していない（今後も、APIキーやパスワードなどの秘密情報はAIに直接貼り付けさせず、ユーザー自身がVercel/Supabase/GitHubの画面から直接入力する運用を継続すること）。
- Supabaseの新しい鍵システムでは、`service_role key` が **「Secret key」**という表示名に変わっている場合がある（`anon key`→`Publishable key`）。

---

## 5. AIアシスタントへの指示（重要）

新しいチャットを開始したAIは、**いきなり構造やコードの提案をしないこと**。まず以下を徹底すること：

1. **ユーザーの話・現在の状況をしっかり聞く**（このドキュメントの内容を踏まえつつ、「今どこで困っているか」「今日は何がしたいか」を確認する）
2. 状況を理解してから、必要であれば実装方針を「軽く」提案し、ユーザーの同意を得てから進める
3. 秘密情報（APIキー・トークン・パスワード等）は絶対にAI側で入力・受け取りしない。ユーザー自身に、Vercel/Supabase/GitHub/LINE Developersの画面上で直接操作してもらう
4. デプロイ・DB変更・外部サービス連携など、影響範囲の大きい作業は、実行前に軽く一声かけてから進める
5. 「やわらかアクション」という名前と世界観（温かい・優しい・急かさない）を、機能追加やUI変更の際にも一貫して意識すること
