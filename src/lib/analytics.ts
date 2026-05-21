"use client";

type AnalyticsParams = Record<string, string | number | boolean>;

export function trackGaEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = (window as Window & { gtag?: (...args: any[]) => void }).gtag;
  if (typeof gtag !== "function") {
    if (process.env.NODE_ENV !== "production") {
      console.log("[ga]", eventName, params);
    }
    return;
  }

  gtag("event", eventName, params);
}
