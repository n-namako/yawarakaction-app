import webpush from "web-push";

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("VAPID鍵の環境変数が設定されていません");
  }

  webpush.setVapidDetails("mailto:support@example.com", publicKey, privateKey);
  isConfigured = true;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendWebPush(
  subscription: PushSubscriptionRecord,
  payload: { title: string; body: string }
): Promise<void> {
  ensureConfigured();
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify(payload)
  );
}
