"use client";

import { useState, useEffect, useCallback } from "react";
import { replayOfflineQueue, getOfflineQueueLength } from "@/services/cache";

interface OnlineStatus {
  isOnline: boolean;
  pendingCount: number;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    void replayOfflineQueue();
    void getOfflineQueueLength().then(setPendingCount);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    void getOfflineQueueLength().then(setPendingCount);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const poll = setInterval(() => {
      void getOfflineQueueLength().then(setPendingCount);
    }, 10_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(poll);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, pendingCount };
}
