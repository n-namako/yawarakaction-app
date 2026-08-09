self.addEventListener("push", (event) => {
  let data = { title: "やわらかアクション（仮）", body: "通知が届きました" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    // JSONでなければそのままテキストとして扱う
    data = { title: "やわらかアクション（仮）", body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/next.svg",
      badge: "/next.svg",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
