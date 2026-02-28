let sniperData = {
    requestId: "4934946125104529153" // قيمة افتراضية
};

// 1. صيد الـ Headers كالعادة
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (details.url.includes("growth-paas")) {
      const headers = details.requestHeaders.reduce((acc, h) => {
        acc[h.name.toLowerCase()] = h.value;
        return acc;
      }, {});
      
      sniperData.headers = {
        "bnc-uuid": headers["bnc-uuid"],
        "csrftoken": headers["csrftoken"],
        "device-info": headers["device-info"],
        "fvideo-id": headers["fvideo-id"],
        "fvideo-token": headers["fvideo-token"]
      };
      chrome.storage.local.set({ bncData: sniperData });
    }
  },
  { urls: ["*://*.binance.com/*"] },
  ["requestHeaders"]
);

// 2. صيد الـ ID المتغير من طلب الـ List (باستخدام تقنية الكشف عن الروابط)
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes("user/reward/list")) {
       console.log("Detected list update, checking for new ID...");
       // بما أن المتصفح لا يعطينا الـ Body مباشرة في onCompleted بسهولة،
       // سنقوم بإرسال إشارة للـ Popup لتنبيه المستخدم أو المحاولة مرة أخرى.
    }
  },
  { urls: ["*://*.binance.com/*"] }
);